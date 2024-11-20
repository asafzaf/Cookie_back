const userRepository = require("../repositories/user.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");
const languages = require("../db/languages.json");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userRepository.find();
  if (!users || users.length === 0) {
    return next(new NotFoundError("No users found"));
  }
  res.status(200).json({
    results: users.length,
    data: [...users],
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const user = await userRepository.retrieve({ userId: id });
  if (!user) {
    return next(new NotFoundError(`User with id ${id} not found`));
  }
  res.status(200).json({ data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await userRepository.create(req.body);
  res.status(201).json(user);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await userRepository.put(id, req.body);
  if (!user) {
    return next(new NotFoundError(`User with id ${id} not found`));
  }
  res.status(200).json(user);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await userRepository.delete(id);
  if (!user) {
    return next(new NotFoundError(`User with id ${id} not found`));
  }
  res.status(204).json(null);
});

exports.changeLanguage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { language } = req.body;
  if (!language) {
    return next(new BadRequestError("Language not provided"));
  }
  if (typeof language !== "string") {
    return next(new BadRequestError("Language must be a string"));
  }
  if (language.length < 2) {
    return next(
      new BadRequestError("Language must be at least 2 characters long")
    );
  }
  if (!languages.options.includes(language)) {
    return next(new BadRequestError("Invalid language option"));
  }
  const user = await userRepository.put(id, { language });
  if (!user) {
    return next(new NotFoundError(`User with id ${id} not found`));
  }
  res.status(200).json(user);
});
