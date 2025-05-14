// Meeting routes
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const redisClient = require('../db/redis');

// Auth middleware (reuse from userRoutes)
const tokenAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    if (!token) return res.sendStatus(401);
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } catch (error) {
    return res.sendStatus(403);
  }
};

// Employee: request meeting
router.post('/request', tokenAuth, meetingController.requestMeeting);
// Manager: handle meeting (accept/reject/delay)
router.post('/handle', tokenAuth, meetingController.handleMeeting);
// Employee: get all managers
router.get('/managers', tokenAuth, meetingController.getManagers);
// Manager: get all meeting requests
router.get('/manager', tokenAuth, meetingController.getMeetingsForManager);
// Employee: get all their meetings
router.get('/employee', tokenAuth, meetingController.getMeetingsForEmployee);
// Get chat history for a meeting
router.get('/:meetingId/chat', tokenAuth, async (req, res) => {
  const { meetingId } = req.params;
  const { ChatMessage } = require('../models/chatMessage');
  const meeting = await require('../models/meeting').Meeting.query().findById(meetingId);
  if (!meeting || (meeting.employee_id !== req.user.id && meeting.manager_id !== req.user.id)) {
    // Instead of 403/404, return empty array for robust frontend compatibility
    return res.json([]);
  }
  const messages = await ChatMessage.query().where('meeting_id', meetingId).orderBy('sent_at');
  res.json(messages);
});

module.exports = router;
