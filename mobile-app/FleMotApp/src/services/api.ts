// services/api.ts
import axios from 'axios';
import Keychain from 'react-native-keychain';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: 'https://nancee-nonadoptable-incisively.ngrok-free.dev/api',
});

api.interceptors.request.use(
  async (config) => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);

          await Keychain.setGenericPassword('firebase_token', newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
