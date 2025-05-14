/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('chat_messages', function(table) {
    table.increments('id').primary();
    table.integer('meeting_id').unsigned().notNullable().references('id').inTable('meetings').onDelete('CASCADE');
    table.integer('sender_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('message').notNullable();
    table.timestamp('sent_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('chat_messages');
};
