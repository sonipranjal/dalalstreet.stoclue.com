import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import subsRoutes from './routes/subs';
import miscRoutes from './routes/misc';
import userRoutes from './routes/users';

import trim from './middleware/trim';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(trim);
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subs', subsRoutes);
app.use('/api/misc', miscRoutes);
app.use('/api/users', userRoutes);

app.get('/api', (_, res) => {
  res.send('Hello Stoclue!');
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log(`Server runnning at ${port}`);
  try {
    await createConnection();
    console.log('database connected!');
  } catch (error) {
    console.log(error);
  }
});
