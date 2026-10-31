import Joi from 'joi';

const attachmentIdSchema = Joi.object({
  attachmentId: Joi.number().integer().positive().required(),
});

const taskIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export {
  attachmentIdSchema,
  taskIdSchema,
};
