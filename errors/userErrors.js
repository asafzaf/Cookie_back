class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.message = message;
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { UnauthorizedError };