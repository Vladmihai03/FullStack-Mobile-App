// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3113', 
});

export default api;
