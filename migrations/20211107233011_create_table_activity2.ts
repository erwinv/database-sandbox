import Knex from 'knex'

const origTable = {
  name: 'activity',
  primaryKey: 'id',
  uniqueColumns: ['udid', 'uuid']
}

const tempTable = `${origTable.name}_temp`
const newPartitionedTable = 'activity2'
const partitionKey = 'created_at'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `create table ${tempTable}`
    + ` (like ${origTable.name} including all)`
  )

  await knex.schema.alterTable(tempTable, (table) => {
    table.dropPrimary()
    table.primary([origTable.primaryKey, partitionKey])

    for (const uniqueColumn of origTable.uniqueColumns) {
      table.dropUnique([uniqueColumn], `${tempTable}_${uniqueColumn}_key`)
      table.unique([uniqueColumn, partitionKey])
    }
  })

  await knex.schema.raw(
    `create table ${newPartitionedTable}`
    + ` (like ${tempTable} including all)`
    + ` partition by range (${partitionKey})`
  )

  await knex.schema.dropTableIfExists(tempTable);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(newPartitionedTable)
}
