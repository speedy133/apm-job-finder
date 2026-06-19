import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import jobsRouter from './routes/jobs';
import savedRouter from './routes/saved';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.use('/api/jobs', jobsRouter);
app.use('/api/saved', savedRouter);

// Example of a protected route using Clerk middleware
app.get('/api/protected', ClerkExpressRequireAuth({}) as any, (req: any, res: Response) => {
  res.json({ status: 'ok', message: 'You are authenticated!', auth: req.auth });
});

// Error handling middleware for Clerk Auth errors
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  if (err.message === 'Unauthenticated') {
    res.status(401).json({ error: 'Unauthenticated' });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
