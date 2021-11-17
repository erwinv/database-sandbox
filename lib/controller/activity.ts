import koa from 'koa'
import Activity from '../model/activity'
import { fakeActivity } from '../model/activity.fake'
import { getQueryFlag } from '../util'

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

export function insert(): koa.Middleware {
  return async (ctx) => {
    const isFake = getQueryFlag(ctx.query, 'fake')
    const isMerge = getQueryFlag(ctx.query, 'merge')

    const { body: reqBody } = ctx.request

    const body = isFake
      ? fakeActivity(isMerge ? reqBody : undefined)
      : reqBody

    ctx.body = await Activity.query().insert(body)
  }
}

export function select(): koa.Middleware {
  return async (ctx) => {
    const { id } = ctx.params
    ctx.body = await Activity.query().findById(id)
      .throwIfNotFound()
  }
}

export function update(method: 'update' | 'patch' = 'update'): koa.Middleware {
  return async (ctx) => {
    const { id } = ctx.params
    const { body: reqBody } = ctx.request

    ctx.body = await Activity.query()[`${method}AndFetchById`](id, reqBody)
      .throwIfNotFound()
  }
}

export function del(): koa.Middleware {
  return async (ctx) => {
    const { id } = ctx.params
    ctx.body = await Activity.query().deleteById(id)
  }
}
