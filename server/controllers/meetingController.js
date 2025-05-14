// Meeting controller
const { Meeting } = require('../models/meeting');
const { User } = require('../models/user');
const amqp = require('amqplib');

const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';
const QUEUE = 'meeting_requests';

// Send meeting request to RabbitMQ
async function sendMeetingRequestToQueue(meetingData) {
  console.log("RabbitMQ URL:", RABBIT_URL); // Log RabbitMQ URL for debugging
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE);
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(meetingData)));
  setTimeout(() => conn.close(), 500);
}

// API: Employee requests a meeting
exports.requestMeeting = async (req, res) => {
  try {
    const { manager_id, scheduled_for, reason } = req.body;
    const employee_id = req.user.id;
    // Convert scheduled_for to ISO string if present
    let scheduledForISO = scheduled_for ? new Date(scheduled_for).toISOString() : null;
    // Send to RabbitMQ for manager to process
    await sendMeetingRequestToQueue({ employee_id, manager_id, scheduled_for: scheduledForISO, reason });
    res.json({ message: 'Meeting request sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send meeting request' });
  }
};

// API: Manager handles a meeting request (accept/reject/delay)
exports.handleMeeting = async (req, res) => {
  try {
    const { id, status, scheduled_for, reason } = req.body;
    const meeting = await Meeting.query().findById(id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.manager_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    await Meeting.query().patchAndFetchById(id, { status, scheduled_for, reason });
    res.json({ message: 'Meeting status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update meeting status' });
  }
};

// API: Get all managers (for employee dashboard)
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.query().join('roles', 'users.role_id', 'roles.id').where('roles.name', 'manager').select('users.id', 'users.username', 'users.name', 'users.email');
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
};

// API: Get meetings for a manager
exports.getMeetingsForManager = async (req, res) => {
  try {
    const manager_id = req.user.id;
    const meetings = await Meeting.query().where('manager_id', manager_id).orderBy('requested_at', 'desc');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

// API: Get meetings for an employee
exports.getMeetingsForEmployee = async (req, res) => {
  try {
    const employee_id = req.user.id;
    const meetings = await Meeting.query().where('employee_id', employee_id).orderBy('requested_at', 'desc');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

// RabbitMQ consumer: create meeting in DB when request is received
async function startMeetingConsumer() {
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE);
  console.log('RabbitMQ connection established and consumer started.'); // Log success
  ch.consume(QUEUE, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      // Convert scheduled_for to ISO string if present
      let scheduledForISO = data.scheduled_for ? new Date(data.scheduled_for).toISOString() : null;
      await Meeting.query().insert({
        employee_id: data.employee_id,
        manager_id: data.manager_id,
        scheduled_for: scheduledForISO,
        status: 'pending',
        reason: data.reason
      });
      ch.ack(msg);
    }
  });
}

exports.startMeetingConsumer = startMeetingConsumer;
