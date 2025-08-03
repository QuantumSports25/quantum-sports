import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Invalid token format.' 
      });
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'your-secret-key') as any;
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. Invalid token.' 
    });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'your-secret-key') as any;
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }
    }
    
    return next();
  } catch (error) {
    // For optional auth, just continue without setting user
    return next();
  }
}; 

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Admins only.' 
  });
}