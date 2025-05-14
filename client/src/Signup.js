import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: 'employee', name: '', email: '' });
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/signup', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSignup}>
        <h2 style={{textAlign: 'center', marginBottom: '1em'}}>Sign Up</h2>
        {error && <div style={{color:'red', marginBottom: '1em'}}>{error}</div>}
        <label htmlFor="signup-username">Username</label>
        <input id="signup-username" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        <label htmlFor="signup-role">Role</label>
        <select id="signup-role" value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
        <label htmlFor="signup-name">Name</label>
        <input id="signup-name" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
        <button type="submit" style={{width: '100%'}}>Sign Up</button>
        <div style={{textAlign: 'center', marginTop: '1em'}}>
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}
