import Knex from 'knex'

const table = 'activity2'
const id_seq = 'activity_id_seq'

export async function up(knex: Knex): Promise<void> {
  const createTableSql = knex.schema.createTable('activity2', (table) => {
    table.bigInteger('id').notNullable().defaultTo(knex.raw(`nextval('${id_seq}')`))
    table.timestamps(true, true)
    table.text('client_id')
    table.text('fid')
    table.text('process_name')
    table.text('udid')
    table.text('message_th')
    table.text('message_en')
    table.jsonb('data')
    table.text('uuid')    
    table.integer('schedule_activity_id')
  })
    .toSQL()

  let createTableRaw = (createTableSql as unknown as Array<typeof createTableSql>)[0]
    .sql.slice(0, -1)

  // table.primary(['id', 'created_at'])
  // table.unique(['udid', 'created_at'])
  // table.unique(['uuid', 'created_at'])
  createTableRaw += ', primary key ("id", "created_at")'
    + ', unique ("udid", "created_at")'
    + ', unique ("uuid", "created_at")'
    + ')'
    + ' partition by range ("created_at")'

  await knex.schema.raw(createTableRaw)

  await knex.schema.alterTable(table, (table) => {
    table.index('client_id')
    table.index('fid')
    table.index('process_name')
    table.index('updated_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(table)
}
