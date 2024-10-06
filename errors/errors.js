class ServerError extends Error {
  constructor(action) {
    super(`Internal Server Error - Couldn't ${action}.`);
    this.status = "fail";
    this.name = "ServerError";
    this.message = `Internal Server Error - Couldn't ${action}.`;
    this.statusCode = 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends Error {
  constructor(entity) {
    super(`${entity} not found.`);
    this.status = "fail";
    this.name = "NotFoundError";
    this.message = `${entity} not found.`;
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends Error {
  constructor(element) {
    super(`please provide a valid ${element}.`);
    this.status = "fail";
    this.name = "BadRequestError";
    this.message = `please provide a valid ${element}.`;
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { ServerError, NotFoundError, BadRequestError };
