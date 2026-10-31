import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import AppError from '../utils/AppError.js';

const authMiddleWare=(req, res, next)=>{
  try {
    const authHeader=req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Authorization token required', 401);
    }

    const [scheme, token]=authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Invalid authorization header', 401);
    }

    const decoded = jwt.verify(
        token,
        config.jwt.secret,
    );

    const userId = Number(decoded.userId);

    if (!Number.isSafeInteger(userId)|| userId<=0) {
      throw new AppError('Invalid authentication token', 401);
    }

    req.userId = userId;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError('Authentication failed', 401));
  }
};

export default authMiddleWare;
