import _ from 'lodash'
import objection from 'objection'
import { DateTime, Duration } from 'luxon'

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

/*
DDL
CREATE TABLE public.activities (
	id bigserial NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	client_id text NULL,
	fid text NULL,
	process_name text NULL,
	udid text NULL,
	message_th text NULL,
	message_en text NULL,
	"data" jsonb NULL,
	uuid text NULL,
	schedule_activity_id int4 NULL,
	CONSTRAINT activities_pkey PRIMARY KEY (id),
	CONSTRAINT activities_udid_key UNIQUE (udid),
	CONSTRAINT activities_uuid_key UNIQUE (uuid)
);
CREATE INDEX idx_activities_client_id ON public.activities USING btree (client_id);
CREATE INDEX idx_activities_created_at ON public.activities USING btree (created_at);
CREATE INDEX idx_activities_fid ON public.activities USING btree (fid);
CREATE INDEX idx_activities_process_name ON public.activities USING btree (process_name);
CREATE INDEX idx_activities_updated_at ON public.activities USING btree (updated_at);
*/

export default class Activity extends objection.Model {
  static tableName = 'activity'

  static columnNameMappers = objection.snakeCaseMappers()
  static jsonSchema = {
    type: 'object',
    properties: {
      createdAt: { type: 'date-time' },
      updatedAt: { type: 'date-time' },
      clientId: { type: 'string' },
      fid: { type: 'string' },
      processName: { type: 'string' },
      udid: { type: 'string' },
      messageTh: { type: 'string' },
      messageEn: { type: 'string' },
      data: { type: 'object' },
      uuid: { type: 'string' },
      scheduleActivityId: { type: 'integer' },
    },
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
