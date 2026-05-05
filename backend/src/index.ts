// VisionClaw Backend - Main Application
import path from 'path';
import express from 'express';
import cors from 'cors';
import evidenceRoutes from './routes/evidence';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/evidence', evidenceRoutes);

app.listen(PORT, () => {
  console.log('VisionClaw Backend running on http://localhost:' + PORT);
  console.log('Analysis Provider: OPENAI');
});

export default app;
