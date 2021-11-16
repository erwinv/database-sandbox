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

export function insert(): koa.Middleware {
  return async (ctx) => {
    const { body: reqBody } = ctx.request
    ctx.body = await Activity.query().insert(reqBody)
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
