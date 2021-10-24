import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import Router from '@koa/router'
import {
  userCoupon,
  node,
  notification,
} from './controller'

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
    .post('/admin/notification/partitions', notification.createWeekPartitions())
    .del('/admin/notification/oldpartitions', notification.dropOldPartitions())

  return app
    .use(logger())
    .use(bodyparser())
    .use(router.routes())
    .use(router.allowedMethods())
}
