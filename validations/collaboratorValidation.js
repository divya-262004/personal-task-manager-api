import Joi from 'joi';

const createCollaboratorSchema= Joi.object({
  userId: Joi.number().integer().positive().required(),
  role: Joi.string().valid('editor', 'viewer').required(),
});

const removeCollaboratorSchema=Joi.object({
  id: Joi.number().integer().positive().required(),
  userId: Joi.number().integer().positive().required(),
});

export {createCollaboratorSchema, removeCollaboratorSchema};
