/**
 * Custom ExpressError class extending built-in JavaScript Error class.
 * This class allows for more specific error handling with custom messages
 * and status codes to be used in middleware functions.
 */
class ExpressError extends Error {
  /**
   * Create a new ExpressError.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code associated with the error.
   */
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

// Export the ExpressError class for use in other modules.
module.exports = ExpressError;
