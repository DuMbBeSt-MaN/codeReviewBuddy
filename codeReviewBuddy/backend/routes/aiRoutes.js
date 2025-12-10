import express from 'express';
import { reviewCode, chatWithAI, suggestFix } from '../controllers/aiController.js';

const router = express.Router();

router.post('/review', reviewCode);
router.post('/chat', chatWithAI);
router.post('/suggest-fix', suggestFix);

export default router;