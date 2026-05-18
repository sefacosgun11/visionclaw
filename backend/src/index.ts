// VisionClaw Backend - Main Application
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

import express from 'express';
import cors from 'cors';
import evidenceRoutes from './routes/evidence';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://visionclaw.vercel.app',
    /https:\/\/visionclaw-.*\.vercel\.app$/ // Preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai: !!process.env.OPENAI_API_KEY,
    provider: process.env.ANALYSIS_PROVIDER || 'openai'
  });
});

app.use('/api/evidence', evidenceRoutes);

app.listen(PORT, () => {
  console.log('VisionClaw Backend running on http://localhost:' + PORT);
  console.log('Analysis Provider: OPENAI');
});

export default app;