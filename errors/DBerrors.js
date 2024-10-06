class CastError extends Error {
  constructor(message) {
    super(message);
    this.status = 'fail';
    this.name = 'CastError';
    this.message = message;
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 'fail';
    this.name = 'ValidationError';
    this.message = message;
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { CastError, ValidationError };