import koa from 'koa'
import Notification from '../model/notification'

export function createWeekPartitions(): koa.Middleware {
  return async (ctx) => {
    await Notification.ensurePartitions()
    ctx.status = 200
  }
}
