export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'restaurant';
  profilePicture?: string;
  country?: string;
  state?: string;
  location?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'restaurant';
  location?: string;
  country?: string;
  state?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

export interface LoginData {
  email: string;
  password: string;
  role: 'customer' | 'restaurant';
}

export interface UpdateProfileData {
  name?: string;
  location?: string;
  country?: string;
  state?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
  profilePicture?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
} 