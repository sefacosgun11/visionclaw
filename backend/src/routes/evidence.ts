// Evidence API Routes

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as evidenceService from '../services/evidenceService';

const router = Router();

// File upload configuration
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// POST /api/evidence/upload - Upload image file and create evidence
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { type, capturedBy, description, taskId, procedureId, stepNumber } = req.body;

    if (!capturedBy) {
      return res.status(400).json({ error: 'capturedBy field is required' });
    }

    const localPath = `/uploads/${req.file.filename}`;

    const evidence = await evidenceService.createEvidence({
      type: type || 'photo',
      capturedBy,
      description,
      taskId,
      procedureId,
      stepNumber: stepNumber ? parseInt(stepNumber) : undefined,
      localPath,
      metadata: {
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date().toISOString()
      }
    });

    res.status(201).json(evidence);
  } catch (error) {
    console.error('Upload evidence error:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to upload evidence' 
    });
  }
});

// POST /api/evidence - Create new evidence item
router.post('/', async (req: Request, res: Response) => {
  try {
    const evidence = await evidenceService.createEvidence(req.body);
    res.status(201).json(evidence);
  } catch (error) {
    console.error('Create evidence error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create evidence' 
    });
  }
});

// GET /api/evidence/:id - Get evidence by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const evidence = await evidenceService.getEvidenceById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    res.json(evidence);
  } catch (error) {
    console.error('Get evidence error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get evidence' 
    });
  }
});

// POST /api/evidence/:id/analyze - Trigger analysis
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const result = await evidenceService.triggerAnalysis(req.params.id, req.body.options || {});
    res.status(202).json(result);
  } catch (error) {
    console.error('Trigger analysis error:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                       error instanceof Error && error.message.includes('already in progress') ? 409 : 500;
    res.status(statusCode).json({ 
      error: error instanceof Error ? error.message : 'Failed to trigger analysis' 
    });
  }
});

// GET /api/evidence/:id/analysis - Get analysis result
router.get('/:id/analysis', async (req: Request, res: Response) => {
  try {
    const result = await evidenceService.getAnalysisResult(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get analysis' 
    });
  }
});

// PUT /api/evidence/:id/analysis/review - Human review
router.put('/:id/analysis/review', async (req: Request, res: Response) => {
  try {
    const analysis = await evidenceService.reviewAnalysis(req.params.id, req.body);
    res.json({
      analysis,
      message: 'Review saved successfully'
    });
  } catch (error) {
    console.error('Review analysis error:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      error: error instanceof Error ? error.message : 'Failed to save review' 
    });
  }
});

export default router;
