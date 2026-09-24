import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'STUDENT' | 'STAFF' | 'MANAGER';
    department?: string;
  };
}

interface JwtPayload {
  id: string;
  role: 'STUDENT' | 'STAFF' | 'MANAGER';
  department?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not defined' });
        return;
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;
      
      req.user = decoded;
      return next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

export const authorize = (...roles: ('STUDENT' | 'STAFF' | 'MANAGER')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Role ${req.user?.role} is not authorized to access this route` 
      });
      return;
    }
    next();
  };
};