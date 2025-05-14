import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

// Protected Route component
const ProtectedRoute = ({ element: Element, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}-dashboard`} />;
  }

  return <Element />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/manager-dashboard" 
            element={<ProtectedRoute element={ManagerDashboard} allowedRole="manager" />} 
          />
          <Route 
            path="/employee-dashboard" 
            element={<ProtectedRoute element={EmployeeDashboard} allowedRole="employee" />} 
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
