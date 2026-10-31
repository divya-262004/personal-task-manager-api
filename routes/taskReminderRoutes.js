import express from 'express';
import authMiddleWare from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

import {
  createTaskReminderSchema,
  taskIdParamSchema,
  reminderIdParamSchema,
  updateTaskReminderSchema,
} from '../validations/taskReminderValidator.js';
import {
  createReminderController,
  getTaskReminderController,
  updateTaskReminderController,
} from '../controllers/taskReminderController.js';

const router=express.Router();
router.use(authMiddleWare);

router.post(
    '/tasks/:taskId/reminders',
    validate(taskIdParamSchema, 'params'),
    validate(createTaskReminderSchema),
    createReminderController,
);

router.get(
    '/tasks/:taskId/reminders',
    validate(taskIdParamSchema, 'params'),
    getTaskReminderController,
);

router.patch(
    '/reminders/:reminderId',
    validate(reminderIdParamSchema, 'params'),
    validate(updateTaskReminderSchema),
    updateTaskReminderController,
);

export default router;
