import React, { useState, useEffect } from 'react';
import { getDash, getUsers, addUser, delUser, getStores, addStore, delStore, getOwners } from '../api';
import './admin.css';

const AdminDash = ({ onLogout }) => {
  const [tab, setTab] = useState('dash');
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [addr, setAddr] = useState('');
  const [role, setRole] = useState('normal_user');
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddr, setStoreAddr] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (tab === 'dash') loadDash();
    else if (tab === 'users') loadUsers();
    else if (tab === 'stores') loadStores();
    else if (tab === 'addStore') loadOwners();
  }, [tab, page]);

  const loadDash = async () => {
    try {
      const res = await getDash();
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers(page);
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStores = async () => {
    try {
      const res = await getStores(page);
      setStores(res.data.stores);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOwners = async () => {
    try {
      const res = await getOwners();
      setOwners(res.data.owners);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelUser = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await delUser(id);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await addUser(name, email, pwd, addr, role);
      setMsg('User added successfully.');
      setName('');
      setEmail('');
      setPwd('');
      setAddr('');
      setRole('normal_user');
      loadUsers();
    } catch (error) {
      setErr(error.response?.data?.msg || 'Unable to add user');
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await addStore(storeName, storeEmail, storeAddr, ownerId || null);
      setMsg('Store added successfully.');
      setStoreName('');
      setStoreEmail('');
      setStoreAddr('');
      setOwnerId('');
      loadStores();
    } catch (error) {
      setErr(error.response?.data?.msg || 'Unable to add store');
    }
  };

  const handleDelStore = async (id) => {
    if (!window.confirm('Delete store?')) return;
    try {
      await delStore(id);
      loadStores();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <nav className="nav">
        <button onClick={() => setTab('dash')} className={tab === 'dash' ? 'active' : ''}>Dashboard</button>
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'active' : ''}>Users</button>
        <button onClick={() => setTab('stores')} className={tab === 'stores' ? 'active' : ''}>Stores</button>
        <button onClick={() => setTab('addUser')} className={tab === 'addUser' ? 'active' : ''}>Add User</button>
        <button onClick={() => setTab('addStore')} className={tab === 'addStore' ? 'active' : ''}>Add Store</button>
        <button onClick={onLogout}>Logout</button>
      </nav>

      <div className="content">
        {tab === 'dash' && data && (
          <div className="stats">
            <div className="stat-box">
              <h3>Total Users</h3>
              <p>{data.totalUsers}</p>
            </div>
            <div className="stat-box">
              <h3>Total Stores</h3>
              <p>{data.totalStores}</p>
            </div>
            <div className="stat-box">
              <h3>Total Ratings</h3>
              <p>{data.totalRatings}</p>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h2>Users</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <button className="btn-del" onClick={() => handleDelUser(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'addUser' && (
          <div className="add-form">
            <h2>Add User</h2>
            {msg && <p className="success">{msg}</p>}
            {err && <p className="error">{err}</p>}
            <form onSubmit={handleAddUser}>
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter full name (min 20 chars)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />

              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="normal_user">Normal User</option>
                <option value="store_owner">Store Owner</option>
                <option value="admin">Admin</option>
              </select>

              <button type="submit">Add User</button>
            </form>
          </div>
        )}

        {tab === 'addStore' && (
          <div className="add-form">
            <h2>Add Store</h2>
            {msg && <p className="success">{msg}</p>}
            {err && <p className="error">{err}</p>}
            <form onSubmit={handleAddStore}>
              <label>Store Name</label>
              <input
                type="text"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                minLength="3"
                required
              />

              <label>Email</label>
              <input
                type="email"
                placeholder="store@example.com"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                required
              />

              <label>Address</label>
              <textarea
                placeholder="Enter store address"
                value={storeAddr}
                onChange={(e) => setStoreAddr(e.target.value)}
                maxLength="400"
                required
              />

              <label>Store Owner (Optional)</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
              >
                <option value="">-- No Owner --</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>

              <button type="submit">Add Store</button>
            </form>
          </div>
        )}

        {tab === 'stores' && (
          <div>
            <h2>Stores</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.address}</td>
                    <td>{s.rating}</td>
                    <td>
                      <button className="btn-del" onClick={() => handleDelStore(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDash;
