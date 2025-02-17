export type UserRole = 'customer' | 'restaurant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  country?: string;
  state?: string;
  location?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginData {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupData extends LoginData {
  name: string;
}

export interface UpdateProfileData {
  name?: string;
  profilePicture?: string;
  country?: string;
  state?: string;
  location?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
} 