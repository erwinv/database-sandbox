import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import Router from '@koa/router'
import {
  userCoupon,
  node,
  activity,
} from './controller'
import {
  ObjectionErrors,
} from './middleware'

export default () => {
  const app = new Koa()

  const router = new Router()
    .get('/', node.ping())
    .get('/ping', node.ping())
    .get('/info', node.info())

    .post('/usercoupon', userCoupon.create())
    .get('/usercoupon', userCoupon.findOne())
    .get('/usercoupon/:id', userCoupon.findById())
    .put('/usercoupon/:id', userCoupon.updateOne())
    .patch('/usercoupon/:id', userCoupon.updateOne())

    .post('/usercoupons', userCoupon.createMany())
    .get('/usercoupons', userCoupon.findMany())

    .del('/usercoupons', userCoupon.bulkDeleteOld())

    .post('/activity',
      ObjectionErrors(),
      activity.insert()
    )
    .get('/activity/:id',
      ObjectionErrors(),
      activity.select()
    )
    .put('/activity/:id',
      ObjectionErrors(),
      activity.update(),
    )
    .patch('/activity/:id',
      ObjectionErrors(),
      activity.update('patch')
    )
    .del('/activity/:id',
      ObjectionErrors(),
      activity.del()
    )

    .post('/admin/activity/partitions', activity.createWeekPartitions())
    .del('/admin/activity/oldpartitions', activity.dropOldPartitions())

  return app
    .use(logger())
    .use(bodyparser())
    .use(router.routes())
    .use(router.allowedMethods())
}
