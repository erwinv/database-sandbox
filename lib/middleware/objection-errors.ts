import _ from 'lodash'
import koa from 'koa'
import objection from 'objection'

const _isNilOrEmpty = (x: any): x is null | undefined | Record<string, never> => _.isNil(x) || _.isEmpty(x)

export default function ObjectionErrors(): koa.Middleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      if (error instanceof objection.ValidationError) {
        ctx.body = _.omitBy({
          message: error.message,
          details: error.data,
        }, _isNilOrEmpty)

        ctx.status = error.statusCode
        ctx.message = `${error.type} ${error.name}`
      } else if (error instanceof objection.NotFoundError) {
        console.error(error)
        if (!_isNilOrEmpty(error.data)) {
          ctx.body = {
            details: error.data,
          }
        }

        ctx.status = error.statusCode
        ctx.message = `${error.type} ${error.name}`
      } else if (error instanceof objection.DBError) {
        ctx.body = {
          message: error.message,
          details: _.omit(error, 'nativeError'),
        }
        ctx.status = 400
        ctx.message = `DatabaseError ${error.name}`
      } else {
        throw error
      }
    }
  }
}
