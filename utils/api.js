import axios from 'axios';

const API_URL = 'https://api.example.com'; // Replace with your API URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Add any request interceptors here if needed
    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

export default apiClient;
