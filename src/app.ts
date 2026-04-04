import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import router from './app/routes/index.js';
import notFound from './app/middlewares/notFound.js';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './app/config/database.js';

const app: Application = express();
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-domain.vercel.app',
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin is not allowed.'));
    },
    credentials: true,
  }),
);

app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'BuddyScript backend is running.',
  });
});

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API health check passed.',
  });
});

app.use('/api/v1', router);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
