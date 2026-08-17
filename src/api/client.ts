import axios from 'axios';

// Configurable vía .env -> VITE_API_URL. Ver .env.example
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
});
