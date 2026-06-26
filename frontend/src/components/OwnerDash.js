import React, { useState, useEffect, useCallback } from 'react';
import { getOwnerDash, changePwd, createOwnerStore } from '../api';
import './owner.css';

const OwnerDash = ({ onLogout }) => {
  const [tab, setTab] = useState('dash');
  const [stores, setStores] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddr, setStoreAddr] = useState('');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDash = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await getOwnerDash();
      setStores(res.data.stores || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error loading dashboard:', err);
      if (err.response?.status === 404) {
        setStores([]);
      } else if (err.response?.status === 401) {
        setMsg('Session expired. Please login again.');
        setTimeout(() => onLogout(), 2000);
      } else {
        setStores([]);
        setMsg(err.response?.data?.msg || 'Error loading dashboard');
      }
    }
  }, [onLogout]);

  useEffect(() => {
    if (tab === 'dash') loadDash();
  }, [tab, loadDash]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await createOwnerStore(storeName, storeEmail, storeAddr);
      setMsg('Store created successfully!');
      setStoreName('');
      setStoreEmail('');
      setStoreAddr('');
      setTimeout(() => {
        setMsg('');
        loadDash();
        setTab('dash');
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error creating store');
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
    <div className="owner-container">
      <nav className="nav">
        <button onClick={() => setTab('dash')} className={tab === 'dash' ? 'active' : ''}>Dashboard</button>
        <button onClick={() => setTab('create')} className={tab === 'create' ? 'active' : ''}>Create Store</button>
        <button onClick={() => setTab('pwd')} className={tab === 'pwd' ? 'active' : ''}>Change Password</button>
        <button onClick={onLogout}>Logout</button>
      </nav>

      <div className="content">
        {msg && <p className="msg">{msg}</p>}

        {tab === 'dash' && (
          <div>
            {loading ? (
              <p>Loading...</p>
            ) : stores.length > 0 ? (
              <>
                <h2>My Stores ({stores.length})</h2>
                {stores.map(store => (
                  <div key={store.id} style={{ marginBottom: '40px' }}>
                    <div className="store-info">
                      <h3>{store.name}</h3>
                      <p><strong>Email:</strong> {store.email}</p>
                      <p><strong>Address:</strong> {store.address}</p>
                      <p><strong>Average Rating:</strong> {store.avgRating}★</p>
                    </div>
                    <h4>Ratings for {store.name}</h4>
                    {store.ratings && store.ratings.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Rating</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {store.ratings.map(r => (
                            <tr key={r.id}>
                              <td>{r.name}</td>
                              <td>{r.rating}★</td>
                              <td>{new Date(r.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No ratings yet for this store</p>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="no-store">
                <h2>No Stores Found</h2>
                <p>You don't have any stores yet. Create one to get started!</p>
                <button onClick={() => setTab('create')}>Create Store</button>
              </div>
            )}
          </div>
        )}

        {tab === 'create' && (
          <div className="pwd-form">
            <h2>Create Store</h2>
            <form onSubmit={handleCreateStore}>
              <input
                type="text"
                placeholder="Store Name (min 3 chars)"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                minLength="3"
                required
              />
              <input
                type="email"
                placeholder="Store Email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                required
              />
              <textarea
                placeholder="Store Address (max 400 chars)"
                value={storeAddr}
                onChange={(e) => setStoreAddr(e.target.value)}
                maxLength="400"
                required
              />
              <button type="submit">Create Store</button>
            </form>
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
                placeholder="New Password (8-16 chars, 1 uppercase, 1 special)"
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

export default OwnerDash;
