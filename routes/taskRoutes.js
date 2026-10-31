import express from 'express';
import authMiddleWare from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validations/taskValidation.js';
import {
  createCollaboratorSchema,
  removeCollaboratorSchema,
} from '../validations/collaboratorValidation.js';

import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  syncTaskWithGoogleCalendarController,
} from '../controllers/taskController.js';

import {
  createCollaboratorController,
  removeCollaboratorController,
} from '../controllers/collaboratorController.js';

import uploadAttachmentMiddleware from
  '../middleware/taskAttachmentMiddleware.js';

import {
  attachmentIdSchema,
  taskIdSchema,
} from '../validations/taskAttachmentValidator.js';

import {
  uploadAttachmentController,
  downloadAttachmentController,
  deleteAttachmentController,
} from '../controllers/taskAttachmentController.js';

const router = express.Router();

router.use(authMiddleWare);

router.post(
    '/',
    validate(createTaskSchema),
    createTaskController,
);
router.get(
    '/',
    validate(taskQuerySchema, 'query'),
    getTasksController,
);
router.get(
    '/:id',
    validate(taskIdSchema, 'params'),
    getTaskByIdController);
router.patch(
    '/:id',
    validate(taskIdSchema, 'params'),
    validate(updateTaskSchema),
    updateTaskController,
);
router.delete('/:id',
    validate(taskIdSchema, 'params'),
    deleteTaskController);

router.post(
    '/:id/collaborators',
    validate(taskIdSchema, 'params'),
    validate(createCollaboratorSchema),
    createCollaboratorController,
);
router.delete(
    '/:id/collaborators/:userId',
    validate(removeCollaboratorSchema, 'params'),
    removeCollaboratorController,
);

router.post(
    '/:id/attachments',
    validate(taskIdSchema, 'params'),
    uploadAttachmentMiddleware,
    uploadAttachmentController,
);

router.get(
    '/attachments/:attachmentId/download',
    validate(attachmentIdSchema, 'params'),
    downloadAttachmentController,
);

router.delete(
    '/attachments/:attachmentId',
    validate(attachmentIdSchema, 'params'),
    deleteAttachmentController,
);

router.post(
    '/:id/google-calendar-sync',
    validate(taskIdSchema, 'params'),
    syncTaskWithGoogleCalendarController,
);

export default router;
