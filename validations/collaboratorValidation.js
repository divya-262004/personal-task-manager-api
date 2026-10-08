import Joi from 'joi';

const createCollaboratorSchema= Joi.object({
  userId: Joi.number().integer().required(),
  role: Joi.string().valid('editor', 'viewer').required(),
});

const removeCollaboratorSchema=Joi.object({
  id: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
});

export {createCollaboratorSchema, removeCollaboratorSchema};
