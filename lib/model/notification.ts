import _ from 'lodash'
import objection from 'objection'
import { DateTime } from 'luxon'

const timeZone = 'Asia/Bangkok'
const tableName = 'notificationV2'

function createWeekPartition(now: DateTime) {
  const thisWeekWednesday = now.set({weekday: 3}).startOf('day')
  const thisWeekSunday = now.set({weekday: 0}).startOf('day')
  const nextWeekSunday = now.set({weekday: 7}).startOf('day')

  return `CREATE TABLE IF NOT EXISTS notification_y${thisWeekWednesday.year}w${thisWeekWednesday.weekNumber} PARTITION OF ${tableName}
  FOR VALUES FROM ('${thisWeekSunday.toISO()}') TO ('${nextWeekSunday.toISO()}');`
}

export default class Notification extends objection.Model {
  static async ensurePartitions() {
    const knex = this.knex()

    for (const weekOffset of _.range(-12, 13)) {
      const now = DateTime.local()
        .setZone(timeZone)
        .plus({ weeks: weekOffset })

      await knex.schema.raw(createWeekPartition(now))
    }
  }
}
