import axios from 'axios';
import Keychain from 'react-native-keychain';

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api',
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

export default api;