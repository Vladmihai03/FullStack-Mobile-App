import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface Date {
  year: string,
  month: string,
  day: string
}

app.get('/', (req, res) => {
  const current_date = new Date();
  const date: Date = {
    year: current_date.getFullYear().toString(),
    month: (current_date.getMonth()+1).toString(),
    day: current_date.getDate().toString()
  }
  res.send(`Hello World! ${date.day} ${date.month} ${date.year}`);
});

app.use(userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
