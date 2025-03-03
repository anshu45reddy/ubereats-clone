import api from './api';
import { SignupData, LoginData, UpdateProfileData, User } from '../types/auth';

export const signup = async (data: SignupData): Promise<User> => {
  const response = await api.post('/auth/signup', data);
  return response.data.user;
};

export const login = async (data: LoginData): Promise<User> => {
  const response = await api.post('/auth/login', data);
  return response.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  return response.data.user;
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.put('/auth/profile', data);
  return response.data.user;
}; 