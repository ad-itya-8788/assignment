import React, { useState, useEffect, useCallback } from 'react';
import { getUserStores, rateStore, changePwd } from '../api';
import './user.css';

const UserDash = ({ onLogout }) => {
  const [tab, setTab] = useState('stores');
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [msg, setMsg] = useState('');

  const loadStores = useCallback(async () => {
    try {
      const res = await getUserStores(page, search, search);
      setStores(res.data.stores || []);
    } catch (err) {
      console.error(err);
      setStores([]);
    }
  }, [page, search]);

  useEffect(() => {
    if (tab === 'stores') loadStores();
  }, [tab, loadStores]);

  const handleRate = async (sid, rating) => {
    try {
      await rateStore(sid, rating);
      loadStores();
      setMsg('Rating saved!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error');
    }
  };

  const handlePwdChange = async (e) => {
    e.preventDefault();
    try {
      await changePwd(oldPwd, newPwd);
      setMsg('Password changed!');
      setOldPwd('');
      setNewPwd('');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="user-container">
      <nav className="nav">
        <button onClick={() => setTab('stores')} className={tab === 'stores' ? 'active' : ''}>Stores</button>
        <button onClick={() => setTab('pwd')} className={tab === 'pwd' ? 'active' : ''}>Change Password</button>
        <button onClick={onLogout}>Logout</button>
      </nav>

      <div className="content">
        {msg && <p className="msg">{msg}</p>}

        {tab === 'stores' && (
          <div>
            <h2>All Stores</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Search by store name or address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="stores-grid">
              {stores.length > 0 ? (
                stores.map(s => (
                  <div key={s.id} className="store-card">
                    <h3>{s.name}</h3>
                    <p><strong>📍 Address:</strong> {s.address}</p>
                    <p><strong>✉️ Email:</strong> {s.email}</p>
                    <p><strong>⭐ Average Rating:</strong> {s.rating}/5</p>
                    <p><strong>Your Rating:</strong> {s.userRating ? `⭐ ${s.userRating}/5` : 'Not rated yet'}</p>
                    <div className="rating-input">
                      <span>Rate this store:</span>
                      <div className="rating-buttons">
                        {[1, 2, 3, 4, 5].map(r => (
                          <button
                            key={r}
                            onClick={() => handleRate(s.id, r)}
                            className={s.userRating === r ? 'active' : ''}
                            title={`Rate ${r} stars`}
                          >
                            {r}★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No stores found</p>
                  {search && <p>Try a different search term</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'pwd' && (
          <div className="pwd-form">
            <h2>Change Password</h2>
            <form onSubmit={handlePwdChange}>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
              />
              <button type="submit">Change</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDash;
