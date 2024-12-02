const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");

exports.checkHealth = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: "ok" });
});
