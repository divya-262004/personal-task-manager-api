import AppError from '../utils/AppError.js';

const validate=(schema, property='body')=>{
  return (req, res, next)=>{
    const {error, value}=schema.validate(req[property], {
      abortEarly: false,
    });

    if (error) {
      const message=error.details
          .map((detail)=>detail.message)
          .join(', ');

      return next(new AppError(message, 400));
    }

    if (property === 'body') {
      req.body = value;
    }

    if (property === 'query') {
      req.validatedQuery = value;
    }

    if (property === 'params') {
      req.validatedParams = value;
    }


    return next();
  };
};

export default validate;
