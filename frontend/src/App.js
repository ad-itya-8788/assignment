import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import AdminDash from './components/AdminDash';
import UserDash from './components/UserDash';
import OwnerDash from './components/OwnerDash';
import { setToken } from './api';
import './App.css';

const App = () => {
  const [page, setPage] = useState('login');
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in API headers on page load
      setToken(token);
      const r = localStorage.getItem('role');
      setRole(r);
      setPage('dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setPage('login');
  };

  const handleLogin = () => {
    const r = localStorage.getItem('role');
    setRole(r);
    setPage('dashboard');
  };

  if (page === 'login') {
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setPage('register')} />;
  }

  if (page === 'register') {
    return <Register onRegister={() => setPage('login')} onSwitchToLogin={() => setPage('login')} />;
  }

  return (
    <div className="app">
      {role === 'admin' && <AdminDash onLogout={handleLogout} />}
      {role === 'normal_user' && <UserDash onLogout={handleLogout} />}
      {role === 'store_owner' && <OwnerDash onLogout={handleLogout} />}
    </div>
  );
};

export default App;
