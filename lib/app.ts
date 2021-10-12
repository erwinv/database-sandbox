import Koa from 'koa'

export default () => {
  const app = new Koa()

  app.use(async (ctx, next) => {
    const status = 'OK'
    ctx.body = { status }
    return next()
  })

  return app
}
