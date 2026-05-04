const AppError = require("../utils/AppError");

/**
 * Creates a validation middleware using a Zod schema.
 * Validates req.body against the provided schema.
 * If validation fails, returns a 400 with the first error message.
 *
 * Usage: validate(registerSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return next(new AppError(message, 400));
    }

    // Replace body with parsed/cleaned data
    req.body = result.data;
    next();
  };
};

module.exports = validate;
