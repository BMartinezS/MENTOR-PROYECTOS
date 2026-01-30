import axios from 'axios';

import { API_URL } from './config';

let authToken: string | null = null;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  console.log(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log('📤 Request data:', config.data);

  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ HTTP Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    console.log(`❌ HTTP Error: ${error.response?.status || 'Network Error'} ${error.config?.url || 'Unknown URL'}`);
    console.log('📥 Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

