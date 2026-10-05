import Joi from 'joi';

const createTaskSchema=Joi.object({

  title: Joi.string().trim().min(1).required(),

  description: Joi.string().allow('').optional(),

  priority: Joi.string()
      .valid('low', 'medium', 'high')
      .required(),

  dueDate: Joi.date().iso().required(),

  status: Joi.string()
      .valid('pending', 'completed')
      .required(),

});

const updateTaskSchema=Joi.object({

  title: Joi.string().trim().min(1).optional(),

  description: Joi.string().allow('').optional(),

  priority: Joi.string()
      .valid('low', 'medium', 'high')
      .optional(),

  dueDate: Joi.date().iso().optional(),

  status: Joi.string()
      .valid('pending', 'completed')
      .optional(),

}).min(1);


const taskQuerySchema=Joi.object({
  priority: Joi.string()
      .valid('low', 'medium', 'high')
      .optional(),

  status: Joi.string()
      .valid('pending', 'completed')
      .optional(),

  dueDateFrom: Joi.date().iso().optional(),

  dueDateTo: Joi.date().iso().optional(),

  sortBy: Joi.string()
      .valid('dueDate', 'priority')
      .optional(),

  order: Joi.string()
      .valid('asc', 'desc')
      .optional(),

  page: Joi
      .number()
      .integer()
      .min(1)
      .optional(),

  limit: Joi
      .number()
      .integer()
      .min(1)
      .optional(),

});

export {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
};
