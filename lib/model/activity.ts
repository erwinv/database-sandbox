import _ from 'lodash'
import objection from 'objection'
import { DateTime, Duration } from 'luxon'
import { nullable } from '../util'

const timeZone = 'Asia/Bangkok'
const numWeeks = 12
const tableName = 'activity2'

function createWeekPartition(now: DateTime) {
  const thisWeekWednesday = now.set({weekday: 3}).startOf('day')
  const thisWeekSunday = now.set({weekday: 0}).startOf('day')
  const nextWeekSunday = now.set({weekday: 7}).startOf('day')

  return `CREATE TABLE IF NOT EXISTS activity_y${thisWeekWednesday.year}w${thisWeekWednesday.weekNumber} PARTITION OF ${tableName}
  FOR VALUES FROM ('${thisWeekSunday.toISO()}') TO ('${nextWeekSunday.toISO()}')`
}

function getAllPartitionNames() {
  return `SELECT inhrelid::regclass AS child
  FROM pg_catalog.pg_inherits
  WHERE inhparent = '${tableName}'::regclass`
}

function isPartitionObsolete(partitionName: string) {
  const match = /^activity_y(\d+)w(\d+)$/.exec(partitionName)
  if (!match) return false

  const [, year, week] = match

  const thisWeekWednesday = DateTime.local()
    .setZone(timeZone)
    .set({ weekday: 3 })
    .startOf('day')

  const partitionWednesday = DateTime
    .fromObject({
      weekYear: _.toNumber(year),
      weekNumber: _.toNumber(week),
      weekday: 3
    }, {
      zone: timeZone,
    })
    .startOf('day')

  return thisWeekWednesday.diff(partitionWednesday) > Duration.fromISO(`P${numWeeks}W`)
}

export default class Activity extends objection.Model {
  static tableName = 'activity'

  static columnNameMappers = objection.snakeCaseMappers()
  static jsonSchema = {
    type: 'object',
    properties: {
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      clientId: nullable({ type: 'string' }),
      fid: nullable({ type: 'string' }),
      processName: nullable({ type: 'string' }),
      udid: nullable({ type: 'string' }),
      messageTh: nullable({ type: 'string' }),
      messageEn: nullable({ type: 'string' }),
      data: nullable({ type: 'object' }),
      uuid: nullable({ type: 'string', format: 'uuid' }),
      scheduleActivityId: nullable({ type: 'integer' }),
    },
  }

  $parseJson(_json: objection.Pojo, opts: objection.ModelOptions) {
    const json = super.$parseJson(_json)

    if (_.isString(json.data)) {
      try {
        json.data = JSON.parse(json.data)
      } catch (error) {
        if (!opts.skipValidation && error instanceof Error) {
          throw new objection.ValidationError({
            type: 'ModelValidation',
            statusCode: 400,
            message: 'data: should be valid JSON',
            data: {
              name: error.name,
              message: error.message,
              input: json.data,
            },
          })
        } else {
          throw error
        }
      }
    }

    if (!opts.patch) {
      _.defaults(json, {
        clientId: null,
        fid: null,
        processName: null,
        udid: null,
        messageTh: null,
        messageEn: null,
        data: null,
        uuid: null,
        scheduleActivityId: null,
      })
    }

    return json
  }
  $formatJson(_json: objection.Pojo) {
    const json = super.$formatJson(_json)

    if (_.isObject(json.data)) {
      json.data = JSON.stringify(json.data)
    }

    return json
  }

  static async ensurePartitions() {
    const knex = this.knex()

    for (const weekOffset of _.range(-numWeeks, numWeeks+1)) {
      const now = DateTime.local()
        .setZone(timeZone)
        .plus({ weeks: weekOffset })

      await knex.schema.raw(createWeekPartition(now))
    }
  }

  static async dropOldPartitions() {
    const knex = this.knex()

    const rawResult = await knex.schema.raw(getAllPartitionNames()) as unknown as Record<'rows', Record<'child', string>[]>
    const rows = rawResult.rows
    const partitionNames = rows.map(({ child }) => child)

    const dropOldPartitionsQuery = partitionNames
      .filter(isPartitionObsolete)
      .map(partitionName => `DROP TABLE IF EXISTS ${partitionName};`)
      .join('\n')

    await knex.schema.raw(dropOldPartitionsQuery)
  }
}
