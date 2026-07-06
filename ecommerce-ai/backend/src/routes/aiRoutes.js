import express from 'express';
import { assistant, generateDescription } from '../controllers/aiController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.post('/assistant', assistant);
router.post('/generate-description', requireAuth, requireAdmin, generateDescription);

export default router;
