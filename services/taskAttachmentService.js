import {randomUUID} from 'node:crypto';
import {TaskAttachment} from '../models/index.js';
import {
  uploadFile,
  deleteFile,
  getDownloadUrl,
  fileExists,
} from './s3Service.js';
import {
  getTaskAccess,
  requireTaskRole,
} from './taskAuthorizationService.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const uploadAttachmentService= async ({
  taskId,
  userId,
  file,
})=>{
  await requireTaskRole(
      taskId,
      userId,
      ['owner', 'editor'],
  );

  const key=`tasks/${taskId}/${randomUUID()}`;

  await uploadFile({
    key,
    body: file.buffer,
    contentType: file.mimetype,
  });

  try {
    const attachment=await TaskAttachment.create({
      taskId,
      originalName: file.originalname,
      objectKey: key,
      mimeType: file.mimetype,
      size: file.size,
    });

    return attachment;
  } catch (error) {
    try {
      await deleteFile(key);
    } catch (cleanupError) {
      logger.error('Failed to clean up uploaded attachment', {
        key,
        error: cleanupError.message,
      });
    }

    throw error;
  }
};

const getAttachmentDownloadUrlService= async ({
  attachmentId,
  userId,
})=>{
  const attachment=await TaskAttachment.findByPk(attachmentId);

  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  await getTaskAccess(attachment.taskId, userId);

  return getDownloadUrl(attachment.objectKey);
};

const softDeleteAttachmentService = async ({
  attachmentId,
  userId,
}) => {
  const attachment = await TaskAttachment.findByPk(attachmentId);

  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  await requireTaskRole(
      attachment.taskId,
      userId,
      ['owner', 'editor'],
  );

  await attachment.destroy();

  return attachment;
};

const restoreAttachmentService = async ({
  attachmentId,
  userId,
}) => {
  const attachment = await TaskAttachment.findByPk(
      attachmentId,
      {paranoid: false},
  );

  if (!attachment || !attachment.deletedAt) {
    throw new AppError('Deleted attachment not found', 404);
  }

  await requireTaskRole(
      attachment.taskId,
      userId,
      ['owner', 'editor'],
  );

  const exists = await fileExists(attachment.objectKey);

  if (!exists) {
    throw new AppError(
        'Attachment file no longer exists in storage',
        404,
    );
  }
  await attachment.restore();

  return attachment;
};

export {
  uploadAttachmentService,
  getAttachmentDownloadUrlService,
  softDeleteAttachmentService,
  restoreAttachmentService,
};
