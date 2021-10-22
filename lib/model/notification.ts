import _ from 'lodash'
import objection from 'objection'
import { DateTime, Duration } from 'luxon'

const timeZone = 'Asia/Bangkok'
const numWeeks = 12
const tableName = 'notificationV2'

function createWeekPartition(now: DateTime) {
  const thisWeekWednesday = now.set({weekday: 3}).startOf('day')
  const thisWeekSunday = now.set({weekday: 0}).startOf('day')
  const nextWeekSunday = now.set({weekday: 7}).startOf('day')

  return `CREATE TABLE IF NOT EXISTS notification_y${thisWeekWednesday.year}w${thisWeekWednesday.weekNumber} PARTITION OF ${tableName}
  FOR VALUES FROM ('${thisWeekSunday.toISO()}') TO ('${nextWeekSunday.toISO()}');`
}

function getAllPartitionNames() {
  return `SELECT inhrelid::regclass AS child
  FROM pg_catalog.pg_inherits
  WHERE inhparent = '${tableName}'::regclass;`
}

function isPartitionObsolete(partitionName: string) {
  const match = /^notification_y(\d+)w(\d+)$/.exec(partitionName)
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

export default class Notification extends objection.Model {
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
