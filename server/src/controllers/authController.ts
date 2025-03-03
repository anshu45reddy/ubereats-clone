import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { SignupRequest, LoginRequest, UpdateProfileRequest } from '../types/auth';

export const signup = async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    const { email, password, role, ...userData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role,
      ...userData,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ where: { email, role } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (
  req: Request<{}, {}, UpdateProfileRequest>,
  res: Response
) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data
    await user.update(req.body);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
}; 