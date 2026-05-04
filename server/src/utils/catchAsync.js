/**
 * Wraps an async route handler to catch errors and forward them
 * to the centralized error handling middleware.
 * Eliminates the need for try/catch in every controller.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
