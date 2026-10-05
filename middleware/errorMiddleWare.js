import logger from "../utils/logger.js";

const errorMiddleWare = (err, req, res, next) => {
    const statuscode = err.statuscode || 500;

    if (statuscode >= 500) {
        logger.error("Unhandled application error", {
            message: err.message,
            stack: err.stack,
            method: req.method,
            path: req.originalUrl
        });
    }

    const message =
        statuscode === 500
            ? "Internal server error"
            : err.message;

    return res.status(statuscode).json({
        message
    });
};

export default errorMiddleWare;