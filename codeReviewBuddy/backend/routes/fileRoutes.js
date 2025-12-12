import express from 'express';
import { saveFile, loadFile, listFiles } from '../controllers/fileController.js';

const router = express.Router();

router.post('/save', saveFile);
router.get('/load', loadFile);
router.get('/list', listFiles);

export default router;