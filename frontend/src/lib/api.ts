import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: '/api', // The proxy we just set up handles the rest!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the Token if the user is logged in
// We will look for 'userInfo' in localStorage
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const token = JSON.parse(userInfo).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;