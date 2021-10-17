import Koa from 'koa'
import initializeMongoose, { teardownMongoose } from './database/mongo'
import initializeObjection, { teardownObjection } from './database/postgres'

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

  app.use(async (ctx, next) => {
    const status = 'OK'
    ctx.body = { status }
    return next()
  })

  return app
}
