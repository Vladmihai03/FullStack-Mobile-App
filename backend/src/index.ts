// index.js
import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { connectToDatabase } from './connect';


dotenv.config();

const app = express();
const port = process.env.PORT;



app.get('/', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
