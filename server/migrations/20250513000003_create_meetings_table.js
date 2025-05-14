/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('meetings', function(table) {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('manager_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamp('scheduled_for');
    table.enu('status', ['pending', 'accepted', 'rejected', 'delayed']).defaultTo('pending');
    table.text('reason');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('meetings');
};
