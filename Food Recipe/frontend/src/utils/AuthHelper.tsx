import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust as needed

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
      refresh: refreshToken,
    });
    if (response.data && response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    }
    return null;
  } catch {
    return null;
  }
};