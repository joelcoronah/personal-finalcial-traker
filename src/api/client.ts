import axios from 'axios';

// Configurable vía .env -> VITE_API_URL. Ver .env.example
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * Joins API_URL with a path returned by the backend (e.g. receiptImageUrl),
 * which comes back as a relative path meant to be requested against the
 * API host, not the frontend's own origin.
 */
export function resolveApiUrl(path: string): string {
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
