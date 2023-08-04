class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.appError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
