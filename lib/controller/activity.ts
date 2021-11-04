import koa from 'koa'
import Activity from '../model/activity'

export function createWeekPartitions(): koa.Middleware {
  return async (ctx) => {
    await Activity.ensurePartitions()
    ctx.status = 200
  }
}

export function dropOldPartitions(): koa.Middleware {
  return async (ctx) => {
    await Activity.dropOldPartitions()
    ctx.status = 200
  }
}
