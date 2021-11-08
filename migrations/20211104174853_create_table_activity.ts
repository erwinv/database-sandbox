import Knex from 'knex'

const table = 'activity'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, (table) => {
    table.bigIncrements('id')
    table.timestamps(true, true)
    table.text('client_id')
    table.text('fid')
    table.text('process_name')
    table.text('udid').unique()
    table.text('message_th')
    table.text('message_en')
    table.jsonb('data')
    table.text('uuid').unique()    
    table.integer('schedule_activity_id')

    table.index('client_id')
    table.index('created_at')
    table.index('fid')
    table.index('process_name')
    table.index('updated_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(table)
}

