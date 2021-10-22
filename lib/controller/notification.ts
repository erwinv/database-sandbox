import koa from 'koa'
import Notification from '../model/notification'

export function createWeekPartitions(): koa.Middleware {
  return async (ctx) => {
    await Notification.ensurePartitions()
    ctx.status = 200
  }
}

export function dropOldPartitions(): koa.Middleware {
  return async (ctx) => {
    await Notification.dropOldPartitions()
    ctx.status = 200
  }
}
