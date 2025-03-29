import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Создаем и настраиваем axios instance
const axiosInstance = axios.create({
  // Для мобильных устройств нужен IP-адрес, а не localhost
  baseURL: 'http://192.168.0.1:3000', // ИЗМЕНИТЕ НА ВАШ IP-АДРЕС!!!
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Таймаут в 10 секунд
});

// Логирование запросов
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('REQUEST:', config.method?.toUpperCase(), config.url);
    console.log('REQUEST DATA:', config.data);
    
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `${token}`;
      console.log('TOKEN ATTACHED');
    }
    return config;
  },
  (error) => {
    console.log('REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Логирование ответов
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('RESPONSE:', response.status, response.config.url);
    console.log('RESPONSE DATA:', response.data);
    return response;
  },
  (error) => {
    console.log('RESPONSE ERROR:', error.message);
    if (error.response) {
      console.log('ERROR STATUS:', error.response.status);
      console.log('ERROR DATA:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// API endpoints for auth
export const login = (phoneNumber: string, code: string | null, region: string, city: string) => {
  console.log('CALLING LOGIN API with:', { phoneNumber, code, region, city });
  return axiosInstance.post("/auth/login", { phoneNumber, code, region, city });
}

export default axiosInstance;
