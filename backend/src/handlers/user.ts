import { Request, Response } from 'express';
import { createJWT, hashPassword, comparePasswords, AuthenticatedRequest } from '../modules/auth';
import { connectToDatabase } from '../database/connect';


export const createNewUser = async (req: Request, res: Response) => {
  const { username, email, password, description } = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const connection = await connectToDatabase();
    
    await connection.execute(
      'INSERT INTO user (username, email, password, description) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, description]
    );

    const token = await createJWT({ email });
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
    const [rows]: any = await connection.execute('SELECT * FROM user WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const token = await createJWT({ email: user.email });
    res.json({ token });
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({ message: 'Error signing in' });
  }
};

export const deleteUser = async (req: Request, res: Response)=>{
  const {email} = req.body;
  try{
    const connection = connectToDatabase();
    if(email == 'popicavlas@gmail.com'){
      res.status(401).json({message: 'Can not delete the admin'});
    }
    (await connection).execute('DELETE  FROM user WHERE EMAIL = ?', [email]);
    res.status(200).json({message: 'DELETED'});
  }catch(e){
    res.status(401).json({message: 'Invalid email to delete'})
  }
}

export const profileUser = async(req: Request, res: Response)=> {
  const {email} = req.body;
  
  try{
    const connection = connectToDatabase();
    const [rows] = await (await connection).execute('SELECT username, email, description FROM user WHERE email = ?', [email]);
    const user = (rows as any)[0];
    if (!user){
      return res.status(404).json({message: 'User not found'})
    }
    
    res.json(user);
  }catch(e){  
    res.status(401).json({message: 'Invalid email to get'})
  }
}

export const listAllUsers = async(req: AuthenticatedRequest, res: Response) => {
  const connection = await connectToDatabase();
  if(!req.user){
    res.status(401).json({message: 'Not admin'})
  }
  const [rows] = await connection.execute('SELECT username, email, description FROM user WHERE email != ?', [req.user?.email]);
  if(!rows){
    return res.status(401).json({ message: 'No users to display' });
  }
  res.json((rows as any));
}

export const verifyUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }

  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT username, email, description FROM user WHERE email = ?', [req.user.email]);
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

export const updateDescription = async (req: AuthenticatedRequest, res: Response) => {
  const { description, email } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ message: 'Invalid description' });
  }

  try {
    const connection = await connectToDatabase();
    await connection.execute(
      'UPDATE user SET description = ? WHERE email = ?',
      [description, email]
    );

    const [rows] = await connection.execute(
      'SELECT username, email, description FROM user WHERE email = ?',
      [email]
    );
    const user = (rows as any)[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ message: 'Error updating description' });
  }
};

export const updateUsername = async (req: AuthenticatedRequest, res: Response) => {
  const { username, email } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid description' });
  }

  try {
    const connection = await connectToDatabase();
    await connection.execute(
      'UPDATE user SET username = ? WHERE email = ?',
      [username, email]
    );

    const [rows] = await connection.execute(
      'SELECT username, email, description FROM user WHERE email = ?',
      [email]
    );
    const user = (rows as any)[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: 'Error updating username' });
  }
};

export const requestVacation = async (req: AuthenticatedRequest, res: Response) => {
  const { start_date, end_date, sent_at } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized!' });
  }

  const [startDay, startMonth, startYear] = start_date.split('.').map(Number);
  const [endDay, endMonth, endYear] = end_date.split('.').map(Number);
  const [sentDay, sentMonth, sentYear] = sent_at.split('.').map(Number);

  if (startYear < sentYear || 
      (startYear === sentYear && startMonth < sentMonth) || 
      (startYear === sentYear && startMonth === sentMonth && startDay <= sentDay)) {
    return res.status(400).json({ message: 'Start date must be after sent date' });
  }

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  const differenceInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  if (differenceInDays < 1) {
    return res.status(400).json({ message: 'End date must be at least one day after start date' });
  }

  try {
    const connection = await connectToDatabase();

    
    console.log("Checking existing requests for email:", req.user.email, "with start_date:", start_date);

    const [existingRequests]: any = await connection.execute(
      'SELECT * FROM vacation_requests WHERE email = ? AND start_date = ?',
      [req.user.email, start_date]
    );

    if (existingRequests.length > 0) {
      return res.status(409).json({ message: 'You already have a vacation request for these dates' });
    }

    console.log("Inserting new request with email:", req.user.email, "start_date:", start_date, "end_date:", end_date, "sent_at:", sent_at);
    await connection.execute(
      'INSERT INTO vacation_requests (email, start_date, end_date, status, sent_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.email, start_date, end_date, 'Pending', sent_at]
    );
    res.status(200).json({ message: "Vacation request submitted successfully" });
  } catch (error) {
    console.error('Error submitting vacation request:', error);
    return res.status(500).json({ message: 'Error submitting vacation request' });
  }
};

export const getUserRequestedVacation = async(req: AuthenticatedRequest, res: Response) => {
  if(!req.user){
    res.status(401).json({message: "Not Authorized"});
  }
  try{
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT start_date, end_date, status, sent_at from vacation_requests where email = ?', [req.user?.email]);
    return res.status(200).json(rows);
  }catch(error){
    console.error("Error submitting vacation request:", error);
    return res.status(500).json({message: 'Error submitting vacation request'});
  }
}

export const listAllReservations = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not admin" });
  }
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT EMAIL, START_DATE, END_DATE,STATUS, SENT_AT FROM vacation_requests');
    if (!rows) {
      return res.status(401).json({ message: 'No users to display' });
    }
    res.status(201).json((rows as any));
  } catch (error) {
    console.error("Error selecting all the rows:", error);
    res.status(500).json({ message: "Error selecting all the reservations" });
  }
};


export const sendResponse = async (req: AuthenticatedRequest, res: Response) => {
  const { status, email, start_date } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const connection = await connectToDatabase();
    const [result]: any = await connection.execute(
      'UPDATE vacation_requests SET status = ? WHERE email = ? AND start_date = ?',
      [status, email, start_date]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vacation request not found' });
    }

    res.status(200).json({ message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
};


