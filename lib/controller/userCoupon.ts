import _ from 'lodash'
import Koa from 'koa'
import UserCoupon, { IUserCoupon } from '../model/usercoupon'
import { fakeUserCoupon } from './userCoupon.fake'
import { getQueryFlag, getQueryNumber, getQueryValue } from '../util'

export function create(): Koa.Middleware {
  return async (ctx) => {
    const isFake = getQueryFlag(ctx.query, 'fake')
    const isMerge = getQueryFlag(ctx.query, 'merge')
    const body = ctx.request.body ?? {}

    const doc: IUserCoupon = isFake
      ? fakeUserCoupon(isMerge ? body : undefined)
      : body

    const couponUser = new UserCoupon(doc)

    ctx.body = await couponUser.save()
    ctx.status = 201
  }
}

export function createMany(): Koa.Middleware {
  return async (ctx) => {
    const isFake = getQueryFlag(ctx.query, 'fake')
    const isMerge = getQueryFlag(ctx.query, 'merge')
    const quantity = getQueryNumber(ctx.query, 'qty', 1)
    const body = ctx.request.body ?? {}

    const docs: IUserCoupon[] = isFake
      ? _.range(quantity)
        .map(() => fakeUserCoupon(isMerge ? body : undefined))
      : body

    ctx.body = await UserCoupon.insertMany(docs, { rawResult: true })
    ctx.status = 201
  }
}

export function findOne(): Koa.Middleware {
  return async (ctx) => {
    const isSample = getQueryFlag(ctx.query, 'sample')
    const body = ctx.request.body ?? {}

    if (isSample) {
      ctx.body = _.first(await UserCoupon.aggregate([
        { $sample: { size: 1 } }
      ]))
    } else {
      ctx.body = await UserCoupon.findOne(body)
    }
  }
}

export function findMany(): Koa.Middleware {
  return async (ctx) => {
    const isSample = getQueryFlag(ctx.query, 'sample')
    const quantity = _.clamp(getQueryNumber(ctx.query, 'qty', 1), 1, 10)
    const body = ctx.request.body ?? {}

    if (isSample) {
      ctx.body = await UserCoupon.aggregate([
        { $sample: { size: quantity } }
      ])
    } else {
      ctx.body = await UserCoupon.findOne(body)
    }
  }
}

export function bulkDeleteOld(): Koa.Middleware {
  return async (ctx) => {
    const endDate = getQueryValue(ctx.query, 'lt')
    if (!/\d{4}-\d{2}-\d{2}/.test(endDate ?? '')) {
      ctx.status = 400
      return
    }

    const bulk = UserCoupon.collection.initializeUnorderedBulkOp()

    bulk
      .find({
        _created_at: {
          $lt: new Date(`${endDate}T00:00:00.000+07:00`)
        }
      })
      .delete()

    // this could possibly take minutes or longer, so don't await
    const start = Date.now()
    bulk.execute({}, (error, result) => {
      const duration = Date.now() - start

      if (error) {
        console.error({ duration, error })
      } else {
        console.info({ duration, result })
      }
    })

    ctx.status = 202
  }
}
