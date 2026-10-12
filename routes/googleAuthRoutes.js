import express from 'express';

import authMiddleWare from '../middleware/authMiddleware.js';
import {
  googleAuthController,
  googleAuthCallbackController,
  disconnectGoogleAccount,
} from '../controllers/googleAuthController.js';

const router=express.Router();

router.get('/google', authMiddleWare, googleAuthController);
router.get('/google/callback', googleAuthCallbackController);
router.delete(
    '/google/disconnect',
    authMiddleWare,
    disconnectGoogleAccount,
);

export default router;
