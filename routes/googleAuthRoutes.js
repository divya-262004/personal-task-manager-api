import express from 'express';
import {
  googleAuthController,
  googleAuthCallbackController,
} from '../controllers/googleAuthController.js';

const router=express.Router();

router.get('/google', googleAuthController);
router.get('/google/callback', googleAuthCallbackController);

export default router;
