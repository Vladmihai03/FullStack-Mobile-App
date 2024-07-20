import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { connectToDatabase } from '../database/connect';

dotenv.config();

export const comparePasswords = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 5);
};

interface User {
  email: string;
}

export const createJWT = async (user: User): Promise<string> => {
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

  
  const connection = await connectToDatabase();
  return token;
};

interface AuthenticatedRequest extends Request {
  user?: { email: string };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  const [, token] = bearer.split(" ");
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    req.user = payload;

    const connection = await connectToDatabase();
    const [rows]: any = await connection.execute('SELECT username, email, description FROM user WHERE email = ?', [payload.email]);
    const user = rows[0];


    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: 'Not authorized' });
  }
};

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const connection = await connectToDatabase();
    const [rows]: any = await connection.execute('SELECT email FROM user WHERE email = ?', [req.user.email]);
    const user = rows[0];

    if (user.email !== 'popicavlas@gmail.com') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: 'Not authorized' });
  }
};



export {
  AuthenticatedRequest
}