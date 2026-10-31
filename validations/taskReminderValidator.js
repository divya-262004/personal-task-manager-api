import Joi from 'joi';

export const createTaskReminderSchema=Joi.object({
  minutesBefore: Joi.number()
      .integer()
      .min(1)
      .required(),
});

export const taskIdParamSchema=Joi.object({
  taskId: Joi.number()
      .integer()
      .positive()
      .required(),
});

export const reminderIdParamSchema=Joi.object({
  reminderId: Joi.number()
      .integer()
      .positive()
      .required(),
});

export const updateTaskReminderSchema = Joi.object({
  minutesBefore: Joi.number()
      .integer()
      .min(1)
      .required(),
});


