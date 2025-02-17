import api from './api';
import { SignupData, LoginData, UpdateProfileData, User } from '../types/auth';

export const signup = async (data: SignupData): Promise<User> => {
  try {
    const response = await api.post('/auth/signup', data);
    return response.data.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const login = async (data: LoginData): Promise<User> => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    // Create a FormData object if there's a profile picture to upload
    if (data.profilePicture && data.profilePicture.startsWith('data:image')) {
      console.log('Handling profile picture upload');
      // In a real application, you would handle the image upload properly
      // For this prototype, we'll just pass the data URL
    }
    
    const response = await api.put('/auth/profile', data);
    return response.data.user;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}; 