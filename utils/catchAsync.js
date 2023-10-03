/**
 * This is a wrapper function to handle asynchronous routes. It takes a function as an argument
 * and returns another function. The returned function will handle any uncaught promise rejections
 * by passing the error to the next middleware.
 *
 * This prevents us from having to use try-catch blocks in every asynchronous route.
 *
 * @param {Function} func - The asynchronous function (typically a route handler) that we want to wrap.
 * @returns {Function} A function that catches any errors from the asynchronous function and forwards them to the next middleware.
 */
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
