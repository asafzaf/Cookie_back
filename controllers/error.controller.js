const { CastError, ValidationError } = require("../errors/DBerrors");
const { UnauthorizedError } = require("../errors/userErrors");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new CastError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new ValidationError(message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ValidationError(message);
};

// const handleJWTError = () => {
//   return new UnauthorizedError("Invalid token. Please log in again!");
// };

// const handleJWTExpiredError = () => {
//   return new UnauthorizedError("Your token has expired! Please log in again.");
// };

const sendErrorProd = (err, res) => {
  res
    .status(err.statusCode)
    .json({ status: err.status, message: err.message, name: err.name });
};

const sendErrorDev = (err, res) => {
  err.stack = err.stack || null;
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") {
      error = handleCastErrorDB(err);
    } else if (err.name === "ValidationError") {
      error = handleValidationErrorDB(err);
    } else if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    } else if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    } else if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.name === "CastError") {
      error = handleCastErrorDB(err);
    } else if (error.name === "ValidationError") {
      error = handleValidationErrorDB(err);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    } else if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    } else if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }
    sendErrorProd(error, res);
  }
};
