import dotenv from 'dotenv'
import path from 'path'
import { MongoMemoryServer } from 'mongodb-memory-server'

declare global {
  var mongod: MongoMemoryServer // eslint-disable-line no-var
}

export default async () => {
  dotenv.config({ path: path.resolve(process.cwd(), 'test', '.env.test') })

  global.mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = global.mongod.getUri()
}
