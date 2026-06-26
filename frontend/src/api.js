import axios from 'axios';

const API = axios.create({
  baseURL: 'https://assignment-k2f4.onrender.com/api' || 'http://localhost:5000/api'
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('uid');
    }
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const register = (name, email, pwd, addr) =>
  API.post('/auth/register', { name, email, pwd, addr });

export const login = (email, pwd) =>
  API.post('/auth/login', { email, pwd });

export const changePwd = (old, newpwd) =>
  API.put('/auth/pwd', { old, newpwd });

// Admin
export const getDash = () =>
  API.get('/admin/dash');

export const addUser = (name, email, pwd, addr, role) =>
  API.post('/admin/user', { name, email, pwd, addr, role });

export const getUsers = (page = 1) =>
  API.get(`/admin/users?page=${page}`);

export const getOwners = () =>
  API.get('/admin/owners');

export const getUser = (id) =>
  API.get(`/admin/user/${id}`);

export const delUser = (id) =>
  API.delete(`/admin/user/${id}`);

export const addStore = (name, email, addr, ownerId) =>
  API.post('/admin/store', { name, email, addr, ownerId });

export const getStores = (page = 1) =>
  API.get(`/admin/stores?page=${page}`);

export const delStore = (id) =>
  API.delete(`/admin/store/${id}`);

// User
export const getUserStores = (page = 1, name = '', addr = '') => {
  let url = `/user/stores?page=${page}`;
  if (name) url += `&name=${name}`;
  if (addr) url += `&addr=${addr}`;
  return API.get(url);
};

export const rateStore = (sid, rating) =>
  API.post('/user/rate', { sid, rating });

// Owner
export const createOwnerStore = (name, email, address) =>
  API.post('/owner/store', { name, email, address });

export const getOwnerDash = () =>
  API.get('/owner/dash');

export default API;
