export interface SignupRequest {
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

export interface LoginRequest {
  email: string;
  password: string;
  role: 'customer' | 'restaurant';
}

export interface UpdateProfileRequest {
  name?: string;
  location?: string;
  country?: string;
  state?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
  profilePicture?: string;
} 