import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.pixelforgedeveloper.com',
  withCredentials: true, // This is the magic line that saves the cookie!
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;