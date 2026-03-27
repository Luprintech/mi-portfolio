import { Router } from 'express';
import { verifyCmsToken } from '../middleware/auth.js';
import { getChatStats } from '../lib/chatStatsStore.js';

const router = Router();

router.get('/chat-stats', verifyCmsToken, (_req, res) => {
    res.json(getChatStats());
});

export default router;
