import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import Router from '@koa/router'
import initializeMongoose, { teardownMongoose } from './database/mongo'
import initializeObjection, { teardownObjection } from './database/postgres'
import {
  userCoupon,
  node,
} from './controller'

export async function initializeServiceDependencies() {
  await Promise.all([
    initializeMongoose(),
    initializeObjection(),
  ])
}

export async function teardownServiceDependencies() {
  await Promise.all([
    teardownMongoose(),
    teardownObjection(),
  ])
}

export default () => {
  const app = new Koa()

  const router = new Router()
    .get('/', node.ping())
    .get('/ping', node.ping())
    .get('/info', node.info())
    .post('/usercoupon', userCoupon.create())
    .get('/usercoupon', userCoupon.findOne())
    .post('/usercoupons', userCoupon.createMany())
    .get('/usercoupons', userCoupon.findMany())
    .del('/usercoupons', userCoupon.bulkDeleteOld())

  return app
    .use(logger())
    .use(bodyparser())
    .use(router.routes())
    .use(router.allowedMethods())
}
