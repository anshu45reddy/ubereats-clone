import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    role: 'customer' | 'restaurant';
  }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId || req.session.role !== 'customer') {
    return res.status(403).json({ message: 'Customer access required' });
  }
  next();
};

export const isRestaurant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId || req.session.role !== 'restaurant') {
    return res.status(403).json({ message: 'Restaurant access required' });
  }
  next();
}; 