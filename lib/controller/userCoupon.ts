import _ from 'lodash'
import Koa from 'koa'
import UserCoupon, { IUserCoupon } from '../model/usercoupon'
import { fakeUserCoupon } from './userCoupon.fake'
import { getQueryFlag, getQueryNumber } from '../util'

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
