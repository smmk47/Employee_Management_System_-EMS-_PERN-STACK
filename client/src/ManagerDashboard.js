import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from './Chat';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profile, setProfile] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [meetingActionMsg, setMeetingActionMsg] = useState('');
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
    fetchEmployees();
    fetchProfile();
    fetchMeetings();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/me');
      setProfile(res.data);
      setProfileData({
        name: res.data.name || '',
        email: res.data.email || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch employees');
      }
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/meetings/manager');
      setMeetings(res.data);
    } catch (err) {
      setError('Failed to fetch meeting requests');
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
      const res = await axios.put('http://localhost:5000/api/users', profileData);
      setProfile(res.data);
      setEditingProfile(false);
      // Update the stored user data
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError(err.response?.data?.error || 'Failed to update profile');
      }
    }
  };

  const startEditing = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || ''
    });
  };

  const cancelEditing = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '' });
  };
  const handleUpdateEmployee = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${id}`, formData);
      // Make sure we preserve the role information when updating the employee list
      const updatedEmployee = {
        ...res.data,
        role: 'employee' // We know this is an employee since we're updating from manager dashboard
      };
      setEmployees(employees.map(emp => 
        emp.id === id ? updatedEmployee : emp
      ));
      setEditingEmployee(null);
      setFormData({ name: '', email: '' });
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError(err.response?.data?.error || 'Failed to update employee');
      }
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to delete employee');
      }
    }
  };

  const handleMeetingAction = async (id, status) => {
    try {
      await axios.post('http://localhost:5000/api/meetings/handle', { id, status });
      setMeetings(meetings.map(m => m.id === id ? { ...m, status } : m));
      setMeetingActionMsg('Meeting status updated!');
      setTimeout(() => setMeetingActionMsg(''), 1500);
    } catch (err) {
      setMeetingActionMsg('Failed to update meeting');
    }
  };

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        
        {/* Manager Profile Section */}
        <div className="profile-section">
          <h2>Your Profile</h2>
          {profile && !editingProfile ? (
            <div className="profile-card">
              <div className="profile-info">
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                <p><strong>Email:</strong> {profile.email || 'Not set'}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </div>
              <button onClick={() => setEditingProfile(true)} className="edit-btn">
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="Enter your email"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="save-btn">Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => setEditingProfile(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Employees Section */}
        <div className="employee-list">
          <h2>Employees</h2>
          {employees.map(employee => (
            <div key={employee.id} className="employee-card">
              {editingEmployee?.id === employee.id ? (
                <form className="edit-form" onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateEmployee(employee.id);
                }}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="button-group">
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" onClick={cancelEditing} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="employee-info">
                    <h3>{employee.name || employee.username}</h3>
                    <p>{employee.email}</p>
                  </div>
                  <div className="button-group">
                    <button onClick={() => startEditing(employee)} className="edit-btn">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="delete-btn"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {employees.length === 0 && (
            <p>No employees found.</p>
          )}
        </div>
        {/* Meeting Requests Section */}
        <div className="employee-list">
          <h2>Meeting Requests</h2>
          {meetingActionMsg && <div className="error-message">{meetingActionMsg}</div>}
          {meetings.map(meeting => (
            <div key={meeting.id} className="employee-card">
              <div className="employee-info">
                <h3>From Employee ID: {meeting.employee_id}</h3>
                <p>Status: {meeting.status}</p>
                <p>Requested For: {meeting.scheduled_for ? new Date(meeting.scheduled_for).toLocaleString() : 'Not set'}</p>
                <p>Reason: {meeting.reason}</p>
              </div>
              <div className="button-group">
                <button onClick={() => handleMeetingAction(meeting.id, 'accepted')} className="edit-btn">Accept</button>
                <button onClick={() => handleMeetingAction(meeting.id, 'rejected')} className="delete-btn">Reject</button>
                <button onClick={() => handleMeetingAction(meeting.id, 'rejected')} className="delete-btn">Finish</button>
                <button onClick={() => handleMeetingAction(meeting.id, 'delayed')} style={{ background: '#f59e42', color: '#fff' }}>Delay</button>
                {meeting.status === 'accepted' && (
                  <button onClick={() => setActiveChatMeetingId(meeting.id)} style={{ background: '#2563eb', color: '#fff' }}>Chat</button>
                )}
              </div>
              {activeChatMeetingId === meeting.id && (
                <Chat meetingId={meeting.id} userId={user.id} />
              )}
            </div>
          ))}
          {meetings.length === 0 && <p>No meeting requests found.</p>}
        </div>
      </main>
    </div>
  );
}
