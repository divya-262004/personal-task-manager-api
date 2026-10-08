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
} from '../controllers/taskController.js';

import {
  createCollaboratorController,
  removeCollaboratorController,
} from '../controllers/collaboratorController.js';

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
router.get('/:id', getTaskByIdController);
router.patch(
    '/:id',
    validate(updateTaskSchema),
    updateTaskController,
);
router.delete('/:id', deleteTaskController);

router.post(
    '/:id/collaborators',
    validate(createCollaboratorSchema),
    createCollaboratorController,
);
router.delete(
    '/:id/collaborators/:userId',
    validate(removeCollaboratorSchema, 'params'),
    removeCollaboratorController,
);
export default router;
