import knex from 'knex'
import objection from 'objection'
import env from '../env'

let connection: ReturnType<typeof knex>

export default async function initializeObjection() {
  if (!connection) {
    connection = knex({
      client: 'pg',
      connection: {
        host: env.POSTGRES_HOST,
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DATABASE,
      }
    })
    objection.Model.knex(connection)
  }
}

export async function teardownObjection() {
  if (connection) {
    await connection.destroy()
  }
}
