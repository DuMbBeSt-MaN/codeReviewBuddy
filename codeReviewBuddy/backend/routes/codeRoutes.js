import express from 'express';
import { executeCode, getLanguages } from '../controllers/codeController.js';

const router = express.Router();

router.post('/execute', executeCode);
router.get('/languages', getLanguages);

export default router;