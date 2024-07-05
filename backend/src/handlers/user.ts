import { Request, Response } from 'express';
import { createJWT, hashPassword, comparePasswords, AuthenticatedRequest } from '../modules/auth';
import { connectToDatabase } from '../database/connect';

export const createNewUser = async (req: Request, res: Response) => {
  const { username, email, password, description } = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const connection = await connectToDatabase();
    
    await connection.execute(
      'INSERT INTO users (username, email, password, description) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, description]
    );

    const token = createJWT({ email });
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = (rows as any)[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createJWT({ email: user.email });
    res.json({ token });
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({ message: 'Error signing in' });
  }
};

export const verifyUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }

  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT username, email, description FROM users WHERE email = ?', [req.user.email]);
    const user = (rows as any)[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

