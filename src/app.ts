import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import router from './app/routes/index.js';
import notFound from './app/middlewares/notFound.js';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import config from './app/config/index.js';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

// Serve uploaded media (created via multer in `uploadPostImage`).
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

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
