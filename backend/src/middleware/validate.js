export function validateBody(schema) {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) return next(error);

    req.body = value;
    return next();
  };
}

