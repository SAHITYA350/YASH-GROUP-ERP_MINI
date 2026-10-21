import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { store } from '../services/store.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const assets = await store.getMediaAssets();
    res.json({ success: true, count: assets.length, data: assets });
  } catch (err) {
    console.error('[Media Assets Error]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to retrieve media assets' });
  }
});

export default router;
