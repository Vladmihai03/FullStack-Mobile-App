import axios from 'axios';

// Folosește adresa IP locală a mașinii tale de dezvoltare
const api = axios.create({
  baseURL: 'http://localhost:3113', 
});

export default api;
