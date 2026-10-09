import multer from 'multer';
import AppError from '../utils/AppError.js';
import {fileTypeFromBuffer} from 'file-type';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
];

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
        new AppError('Unsupported file type', 400),
        false,
    );
  }

  return callback(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
}).single('file');

const uploadAttachmentMiddleware = (req, res, next) => {
  upload(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(
            new AppError('File size must not exceed 5 MB', 413),
        );
      }

      return next(new AppError(error.message, 400));
    }

    if (error) {
      return next(error);
    }

    if (!req.file) {
      return next(new AppError('File is required', 400));
    }

    try {
      const detectedType = await fileTypeFromBuffer(req.file.buffer);

      if (
        !detectedType ||
        !allowedMimeTypes.includes(detectedType.mime) ||
        detectedType.mime !== req.file.mimetype
      ) {
        return next(
            new AppError('File content does not match its type', 400),
        );
      }

      return next();
    } catch (validationError) {
      return next(validationError);
    }

    return next();
  });
};

export default uploadAttachmentMiddleware;
