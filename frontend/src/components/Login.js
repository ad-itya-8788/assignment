import React, { useState } from 'react';
import { login, setToken } from '../api';
import './auth.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const res = await login(email, pwd);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('uid', res.data.user.id);
      onLogin();
    } catch (error) {
      setLoading(false);
      setErr(error.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {err && <p className="error">{err}</p>}
        {loading && <p className="loading">Logging in...</p>}
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="switch-link">
          <p>Don't have an account? <button onClick={onSwitchToRegister} disabled={loading}>Register Here</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
