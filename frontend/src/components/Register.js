import React, { useState } from 'react';
import { register } from '../api';
import './auth.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [addr, setAddr] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess('');
    setLoading(true);

    try {
      await register(name, email, pwd, addr);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => onRegister(), 2000);
    } catch (error) {
      setLoading(false);
      setErr(error.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {err && <p className="error">{err}</p>}
        {success && <p className="success">{success}</p>}
        {loading && <p className="loading">Registering...</p>}
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Name (min 20 chars)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input 
            type="text" 
            placeholder="Address" 
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Password (8-16 chars, 1 uppercase, 1 special)" 
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="switch-link">
          <p>Already have an account? <button onClick={onSwitchToLogin} disabled={loading}>Login Here</button></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
