import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const authMiddleWare=(req, res, next)=>{
  try {
    const authHeader=req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization token required',
      });
    }

    const token=authHeader.split(' ')[1];
    const decoded = jwt.verify(
        token,
        config.jwt.secret,
    );

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT authentication failed', {
        path: req.originalUrl,
        method: req.method,
      });

      res.status(401).json(
          {
            message: 'Invalid or expired token',
          },
      );
    }
  }
}; ;

export default authMiddleWare;
