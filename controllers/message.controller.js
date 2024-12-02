const messageRepository = require("../repositories/message.repository");
const userRepository = require("../repositories/user.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await messageRepository.find();
  if (!messages || messages.length === 0) {
    return next(new NotFoundError("No messages found"));
  }
  res.status(200).json({
    results: messages.length,
    data: [...messages],
  });
});

exports.getMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const message = await messageRepository.retrieve(id);
  if (!message) {
    return next(new NotFoundError(`Message with id ${id} not found`));
  }
  res.status(200).json({ data: message });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const message = await messageRepository.create(req.body);
  res.status(201).json(message);
});

exports.updateMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const message = await messageRepository.put(id, req.body);
  if (!message) {
    return next(new NotFoundError(`Message with id ${id} not found`));
  }
  res.status(200).json(message);
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const message = await messageRepository.delete(id);
  if (!message) {
    return next(new NotFoundError(`Message with id ${id} not found`));
  }
  res.status(204).json(null);
});

exports.getMessagesByUserId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await userRepository.retrieve({ _id: id });
  if (!user) {
    return next(new NotFoundError(`User with id ${id} not found`));
  }
  const messages = await messageRepository.findByUserId(id);
  if (!messages || messages.length === 0) {
    return next(new NotFoundError(`No messages found for user with id ${id}`));
  }
  res.status(200).json({
    results: messages.length,
    data: [...messages],
  });
});

// exports.createMessageForUser = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const user = await userRepository.retrieve(id);
//     if (!user) {
//         return next(new NotFoundError(`User with id ${id} not found`));
//     }
//     const message = await messageRepository.create({ ...req.body, userId: id });
//     res.status(201).json(message);
// });
