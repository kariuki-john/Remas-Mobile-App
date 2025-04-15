import { encode } from './encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const BASE_URL = 'http://161.97.69.205:6790/remas/api/v1';


export const apiPostPublic = async (endpoint, data = {}) => {
  try {
    console.log('(  Sending PUBLIC POST to:', BASE_URL + endpoint);
    console.log('( Headers:', { 'Content-Type': 'application/json' });

    const response = await axios.post(`${BASE_URL}${endpoint}`, null, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('(  Response Status:', response.status);
    return response.data;
  } catch (error) {
    console.log(' LOG  Error:', error?.response?.data || error.message);
    throw error;
  }
}


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


export const apiRegister = async (endpoint, data) => {
  try {
    const isFormData = data instanceof FormData;
    const headers = {};
    if (isFormData) {
          } else {
      headers['Content-Type'] = 'application/json';
    }
    
    console.log("Sending POST to:", `${BASE_URL}${endpoint}`);
    console.log("Headers:", headers);
    console.log("Data:", isFormData ? 'FormData' : JSON.stringify(data));
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    
    const status = response.status;
    const text = await response.text();
    
    console.log("Response Status:", status);
    console.log("Raw Response Text:", text);
    
    if (text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return { 
          success: false, 
          message: `Invalid JSON response (status ${status})`,
          rawResponse: text
        };
      }
    } else {
      return { 
        success: false, 
        message: `Empty response from server (status ${status})` 
      };
    }
  } catch (error) {
    console.error('POST error:', error);
    throw error;
  }
};

export const otpVerification = async (endpoint, { email, otp, newPassword }) => {
  const encodedPassword = encode(newPassword); // your custom encode function
  const formData = new FormData();

  formData.append('email', email);
  formData.append('otp', otp);
  formData.append('newPassword', encodedPassword);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      // ❌ DO NOT set Content-Type manually; let fetch set the boundary
    });

    const status = response.status;
    const text = await response.text();

    console.log("OTP Verification Response Status:", status);
    console.log("Raw Response Text:", text);

    if (text) {
      return JSON.parse(text);
    } else {
      return {
        success: false,
        message: `Empty response from server (status ${status})`,
      };
    }
  } catch (error) {
    console.error('OTP verification error:', error);
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

    console.log("Sending POST to:", `${BASE_URL}${endpoint}`);
    console.log("Headers:", headers);
    console.log("Data:", isFormData ? 'FormData' : JSON.stringify(data));

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    const status = response.status;
    const text = await response.text();

    console.log("Response Status:", status);
    console.log("Raw Response Text:", text);

    if (text) {
      return JSON.parse(text);
    } else {
      return { success: false, message: `Empty response from server (status ${status})` };
    }
  } catch (error) {
    console.error('POST error:', error);
    throw error;
  }
};


export const apiPut = async (endpoint, data) => {
  const token = await AsyncStorage.getItem('token');
  return axios.put(`${BASE_URL}${endpoint}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

