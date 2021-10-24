import mongoose from 'mongoose'
import objection from 'objection'
import knex from 'knex'

jest.setTimeout(2000)

let connection: ReturnType<typeof knex>

beforeAll(async () => {
  connection = knex({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  })

  await Promise.all([
    mongoose.connect(process.env.MONGODB_URI!),
    (async () => {
      // TODO run migrations here
    })()
  ])

  objection.Model.knex(connection)
})

afterAll(async () => {
  await Promise.all([
    mongoose.disconnect(),
    connection.destroy(),
  ])
})
