import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const generateToken = (id: string, role: string, department?: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Fatal Error: JWT_SECRET environment variable is not defined.');
  }
  return jwt.sign({ id, role, department }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Login user / Get token
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide both email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role, user.department);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};