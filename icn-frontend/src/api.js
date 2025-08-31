import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api' // dev uses env; fallback allows CRA proxy
});

export default api;
