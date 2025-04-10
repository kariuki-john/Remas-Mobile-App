import { encode } from './encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'http://161.97.69.205:6790/remas/api/v1'; 



export const login = async (email, password) => {
  const encodedPassword = encode(password);

  try {
    const res = await fetch(`${BASE_URL}/user/all/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: encodedPassword,
      }),
    });

    const data = await res.json();
    console.log('Login response:', data);

    if (res.ok && data?.data?.token) {
      await AsyncStorage.setItem('token', data.data.token);
      console.log('Token stored:', data.data.token);
    } else {
      console.warn('Login failed or token missing');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const apiGet = async (endpoint) => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Token used in request:', token); 

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    
    if (!text) {
      console.warn('Empty response body for', endpoint);
      return { data: [] }; 
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('GET error:', error);
    throw error;
  }
};


export const apiPost = async (endpoint, data) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const isFormData = data instanceof FormData;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('POST error:', error);
    throw error;
  }
};

export const apiPut = async (endpoint, data) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('PUT error:', error);
    throw error;
  }
};
