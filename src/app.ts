import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(express.json());
app.use(cors());

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

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

export default app;
