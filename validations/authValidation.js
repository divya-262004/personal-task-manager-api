import Joi from 'joi';

const registerSchema=Joi.object({

  username: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required(),

  email: Joi.string()
      .trim()
      .email()
      .required(),

  password: Joi.string()
      .min(6)
      .required(),

});

const loginSchema=Joi.object({

  email: Joi.string()
      .trim()
      .email()
      .required(),

  password: Joi.string()
      .min(6)
      .required(),
});

export {
  registerSchema,
  loginSchema,
};
