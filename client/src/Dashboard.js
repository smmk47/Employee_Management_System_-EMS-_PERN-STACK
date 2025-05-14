import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [info, setInfo] = useState({ name: user?.name || '', email: user?.email || '' });
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (!user) window.location = '/login';
    fetchEmployees();
  }, [user]);

  const fetchEmployees = () => {
    if (user?.role === 'manager') {
      axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      }).then(res => setEmployees(res.data));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/me', info, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setMessage('Info updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Update failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeForm({ name: emp.name || '', email: emp.email || '' });
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/employees/${editingEmployee.id}`, employeeForm, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setMessage('Employee updated successfully');
      setEditingEmployee(null);
      fetchEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update employee');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/employees/${employeeId}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setMessage('Employee deleted successfully');
      fetchEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete employee');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location = '/login';
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div style={{maxWidth: 500, margin: '0 auto'}}>
        <h2 style={{textAlign: 'center', marginBottom: '1em'}}>Welcome, {user.username} ({user.role})</h2>
        <form onSubmit={handleUpdate}>
          <label htmlFor="dashboard-name">Name</label>
          <input id="dashboard-name" placeholder="Name" value={info.name} onChange={e=>setInfo({...info, name: e.target.value})} />
          <label htmlFor="dashboard-email">Email</label>
          <input id="dashboard-email" placeholder="Email" value={info.email} onChange={e=>setInfo({...info, email: e.target.value})} />
          <button type="submit" style={{width: '100%'}}>Update Info</button>
        </form>
        {message && <div style={{margin: '1em 0', color: message.includes('failed') ? 'red' : 'green', textAlign: 'center'}}>{message}</div>}
        <button onClick={handleLogout} style={{width: '100%', marginBottom: '2em'}}>Logout</button>
      </div>

      {user.role === 'manager' && (
        <div style={{maxWidth: 700, margin: '2em auto 0'}}>
          <h3>Manage Employees</h3>
          {editingEmployee ? (
            <form onSubmit={handleUpdateEmployee} style={{maxWidth: '100%'}}>
              <h4>Edit Employee: {editingEmployee.username}</h4>
              <label>Name</label>
              <input
                placeholder="Name"
                value={employeeForm.name}
                onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})}
              />
              <label>Email</label>
              <input
                placeholder="Email"
                value={employeeForm.email}
                onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})}
              />
              <div style={{display: 'flex', gap: '1em'}}>
                <button type="submit" style={{flex: 1}}>Save Changes</button>
                <button type="button" onClick={() => setEditingEmployee(null)} style={{flex: 1, background: '#6b7280'}}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="employee-list" style={{background: 'white', padding: '1em', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              {employees.map(emp => (
                <div key={emp.id} style={{
                  padding: '1em',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{emp.username}</strong>
                    <div style={{color: '#666'}}>{emp.name} • {emp.email}</div>
                  </div>
                  <div style={{display: 'flex', gap: '0.5em'}}>
                    <button
                      onClick={() => handleEditEmployee(emp)}
                      style={{background: '#4f46e5', padding: '0.5em 1em'}}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp.id)}
                      style={{background: '#dc2626', padding: '0.5em 1em'}}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <p style={{textAlign: 'center', color: '#666'}}>No employees found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
