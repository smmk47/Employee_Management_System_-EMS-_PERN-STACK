/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Ensure roles table exists
  const hasRolesTable = await knex.schema.hasTable('roles');
  if (!hasRolesTable) {
    await knex.schema.createTable('roles', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.timestamps(true, true);
    });
  }

  // Ensure users table exists
  const hasUsersTable = await knex.schema.hasTable('users');
  if (!hasUsersTable) {
    await knex.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.integer('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('CASCADE');
      table.string('name');
      table.string('email');
      table.timestamps(true, true);
    });
  }

  // Ensure roles exist in table (id: 1 for manager, id: 2 for employee)
  await knex('roles').insert([
    { id: 1, name: 'manager' },
    { id: 2, name: 'employee' }
  ]).onConflict('id').ignore();

  // REMOVE dummy user insertion to avoid duplicate key errors
  // If you want to add users, do it via the app or a custom script, not in this seed file
};
