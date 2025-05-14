import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from './Chat';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [managers, setManagers] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState({ scheduled_for: '', reason: '' });
  const [meetingMessage, setMeetingMessage] = useState('');
  const [activeChatMeetingId, setActiveChatMeetingId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Set default authorization header
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchManagers();
    // eslint-disable-next-line
  }, [navigate, token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/me');
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || ''
      });
    } catch (err) {
      setError('Failed to fetch profile');
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/meetings/managers');
      setManagers(res.data);
    } catch (err) {
      setError('Failed to fetch managers');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/users`, formData);
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError(err.response?.data?.error || 'Failed to update profile');
      }
    }
  };

  const openMeetingModal = (manager) => {
    setSelectedManager(manager);
    setShowMeetingModal(true);
    setMeetingDetails({ scheduled_for: '', reason: '' });
    setMeetingMessage('');
  };

  const sendMeetingRequest = async () => {
    try {
      await axios.post('http://localhost:5000/api/meetings/request', {
        manager_id: selectedManager.id,
        scheduled_for: meetingDetails.scheduled_for,
        reason: meetingDetails.reason
      });
      setMeetingMessage('Meeting request sent!');
      setTimeout(() => setShowMeetingModal(false), 1000);
    } catch (err) {
      setMeetingMessage('Failed to send request');
    }
  };

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="profile-section">
          <h2>Your Profile</h2>
          {error && <div className="error-message">{error}</div>}

          {profile && !isEditing ? (
            <div className="profile-card">
              <div className="profile-info">
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                <p><strong>Email:</strong> {profile.email || 'Not set'}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </div>
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Managers Section */}
        <div className="employee-list">
          <h2>Managers</h2>
          {managers.map(manager => (
            <div key={manager.id} className="employee-card">
              <div className="employee-info">
                <h3>{manager.name || manager.username}</h3>
                <p>{manager.email}</p>
              </div>
              <div className="button-group">
                <button onClick={() => openMeetingModal(manager)} className="edit-btn">Request Meeting</button>
              </div>
            </div>
          ))}
          {managers.length === 0 && <p>No managers found.</p>}
        </div>

        {/* Meeting Requests for Employee */}
        <div className="employee-list">
          <h2>Your Meeting Requests</h2>
          <EmployeeMeetings />
        </div>

        {/* Meeting Modal */}
        {showMeetingModal && (
          <div className="modal" style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', maxWidth: 400, margin: '2em auto' }}>
            <h3>Request Meeting with {selectedManager?.name || selectedManager?.username}</h3>
            <label>Date & Time</label>
            <input type="datetime-local" value={meetingDetails.scheduled_for} onChange={e => setMeetingDetails({ ...meetingDetails, scheduled_for: e.target.value })} />
            <label>Reason</label>
            <textarea value={meetingDetails.reason} onChange={e => setMeetingDetails({ ...meetingDetails, reason: e.target.value })} placeholder="Reason for meeting" style={{ width: '100%', minHeight: 60 }} />
            {meetingMessage && <div style={{ color: meetingMessage.includes('sent') ? 'green' : 'red', margin: '1em 0' }}>{meetingMessage}</div>}
            <div className="button-group">
              <button onClick={sendMeetingRequest} className="save-btn">Send Request</button>
              <button onClick={() => setShowMeetingModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmployeeMeetings() {
  const [meetings, setMeetings] = React.useState([]);
  const [error, setError] = React.useState('');
  const [activeChatMeetingId, setActiveChatMeetingId] = React.useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  React.useEffect(() => {
    axios.get('http://localhost:5000/api/meetings/employee')
      .then(res => setMeetings(res.data))
      .catch(() => setError('Failed to fetch meetings'));
  }, []);
  if (error) return <div className="error-message">{error}</div>;
  return (
    <div>
      {meetings.map(meeting => (
        <div key={meeting.id} className="employee-card">
          <div className="employee-info">
            <h3>With Manager ID: {meeting.manager_id}</h3>
            <p>Status: {meeting.status}</p>
            <p>Scheduled For: {meeting.scheduled_for ? new Date(meeting.scheduled_for).toLocaleString() : 'Not set'}</p>
            <p>Reason: {meeting.reason}</p>
          </div>
          {meeting.status === 'accepted' && (
            <button onClick={() => setActiveChatMeetingId(meeting.id)} style={{ background: '#2563eb', color: '#fff' }}>Chat</button>
          )}
          {activeChatMeetingId === meeting.id && (
            <Chat meetingId={meeting.id} userId={user.id} />
          )}
        </div>
      ))}
      {meetings.length === 0 && <p>No meeting requests found.</p>}
    </div>
  );
}
