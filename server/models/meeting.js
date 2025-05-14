// Meeting model for Objection.js
const { Model } = require('objection');

class Meeting extends Model {
  static get tableName() {
    return 'meetings';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['employee_id', 'manager_id'],
      properties: {
        id: { type: 'integer' },
        employee_id: { type: 'integer' },
        manager_id: { type: 'integer' },
        requested_at: { type: 'string', format: 'date-time' },
        scheduled_for: { type: ['string', 'null'], format: 'date-time' },
        status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'delayed'] },
        reason: { type: ['string', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const { User } = require('./user');
    return {
      employee: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'meetings.employee_id',
          to: 'users.id'
        }
      },
      manager: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'meetings.manager_id',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = { Meeting };
