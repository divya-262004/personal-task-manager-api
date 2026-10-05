const createRateLimiter = (windowMs, maxRequests) => {
  const reqStore = new Map();

  const cleanupInterval = setInterval(() => {
    const currTime = Date.now();

    for (const [clientIp, clientData] of reqStore.entries()) {
      if (currTime - clientData.windowStart >= windowMs) {
        reqStore.delete(clientIp);
      }
    }
  }, windowMs);

  cleanupInterval.unref();

  return (req, res, next) => {
    try {
      const clientIp = req.ip;
      const currTime = Date.now();

      const clientData = reqStore.get(clientIp);

      if (!clientData) {
        reqStore.set(clientIp, {
          count: 1,
          windowStart: currTime,
        });

        return next();
      }

      const elapsedTime =
                currTime - clientData.windowStart;

      if (elapsedTime >= windowMs) {
        reqStore.set(clientIp, {
          count: 1,
          windowStart: currTime,
        });

        return next();
      }

      clientData.count += 1;

      if (clientData.count > maxRequests) {
        return res.status(429).json({
          message: 'Too many requests. Please try again later.',
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        message: 'Rate limiting failed',
      });
    }
  };
};

export default createRateLimiter;
