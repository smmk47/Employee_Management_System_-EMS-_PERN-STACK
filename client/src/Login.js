import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Redirect based on role
      const role = res.data.user.role;
      if (role === 'manager') {
        navigate('/manager-dashboard');
      } else if (role === 'employee') {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleLogin}>
        <h2 style={{textAlign: 'center', marginBottom: '1em'}}>Login</h2>
        {error && <div style={{color:'red', marginBottom: '1em'}}>{error}</div>}
        <label htmlFor="login-username">Username</label>
        <input id="login-username" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" style={{width: '100%'}}>Login</button>
        <div style={{textAlign: 'center', marginTop: '1em'}}>
          No account? <a href="/signup">Sign up</a>
        </div>
      </form>
    </div>
  );
}
