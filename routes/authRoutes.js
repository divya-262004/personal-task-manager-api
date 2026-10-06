import express from 'express';
import {register, login} from '../controllers/authController.js';
import createRateLimiter from '../middleware/ratelimiting.js';

import validate from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
} from '../validations/authValidation.js';

const router=express.Router();
const loginRateLimiter=createRateLimiter(60*1000, 5);

router.post(
    '/register',
    validate(registerSchema),
    register);
router.post(
    '/login',
    validate(loginSchema),
    loginRateLimiter,
    login);

export default router;
