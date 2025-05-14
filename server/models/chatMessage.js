const { Model } = require('objection');

class ChatMessage extends Model {
  static get tableName() {
    return 'chat_messages';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['meeting_id', 'sender_id', 'message'],
      properties: {
        id: { type: 'integer' },
        meeting_id: { type: 'integer' },
        sender_id: { type: 'integer' },
        message: { type: 'string' },
        sent_at: { type: 'string', format: 'date-time' }
      }
    };
  }
}

module.exports = { ChatMessage };
