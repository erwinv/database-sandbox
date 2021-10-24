import initializeMongoose, { teardownMongoose } from './database/mongo'
import initializeObjection, { teardownObjection } from './database/postgres'

export default async function initializeServiceDependencies() {
  await Promise.all([
    initializeMongoose(),
    initializeObjection(),
  ])

  process.on('beforeExit', teardownServiceDependencies)
  process.on('SIGINT', teardownServiceDependencies)
  process.on('SIGTERM', teardownServiceDependencies)
}

export async function teardownServiceDependencies() {
  await Promise.all([
    teardownMongoose(),
    teardownObjection(),
  ])
}
