/**
 * Custom application error with an HTTP status code.
 */
class AppError extends Error {
  /**
   * Creates an application error.
   * @param {string} message Error message.
   * @param {number} statusCode HTTP status code.
   */
  constructor(message, statusCode) {
    super(message);

    this.statuscode=statusCode;
  }
}

export default AppError;
