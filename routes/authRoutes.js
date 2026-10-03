import express from "express"
import { register, login } from "../controllers/authController.js"
import createRateLimiter from "../middleware/ratelimiting.js"

const router=express.Router();
const loginRateLimiter=createRateLimiter(60*1000, 5)

router.post("/register", register);
router.post("/login", loginRateLimiter, login)

export default router;