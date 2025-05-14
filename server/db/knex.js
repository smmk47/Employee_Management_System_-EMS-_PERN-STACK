const Knex = require('knex');
const { Model } = require('objection');
const config = require('../knexfile');
const createUserTables = require('../migrations/20250509000002_create_users_table');
const createRolesTables = require('../migrations/20250509000001_create_roles_table');

// Initialize knex
const knex = Knex(config.development);

// Bind all Models to the knex instance
Model.knex(knex);

// Tocheck if the table exists


// createRolesTables.up(knex).then(() => {

//     console.log("Knex initialized and Roles table Created.");
// }).catch((error) => {
// console.log("Error initializing Knex:", error);
// })

// createUserTables.up(knex).then(() => {

//     console.log("Knex initialized and Users Table Created.");
// }).catch((error) => {
// console.log("Error initializing Knex:", error);
// })




module.exports = knex;
