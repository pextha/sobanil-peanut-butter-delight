import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';

// Interface to add 'user' to the Request object
interface AuthRequest extends Request {
  user?: any;
}

// 1. Protect: Verifies the User is Logged In
export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // Check if the "Authorization" header sends a "Bearer" token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get the token string (remove "Bearer " from the start)
      token = req.headers.authorization.split(' ')[1];

      // Decode the token using your secret key
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Find the user in the DB (exclude password) and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next step
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// 2. Admin: Verifies the User is an Admin
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};