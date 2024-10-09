const unrecognizedItemRepository = require("../repositories/unrecognizedItem.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");

exports.getAllUnrecognizedItems = catchAsync(async (req, res, next) => {
  const items = await unrecognizedItemRepository.find();
  if (!items || items.length === 0) {
    return next(new NotFoundError("No items found"));
  }
  res.status(200).json({
    results: items.length,
    data: [...items],
  });
});

exports.getUnrecognizedItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await unrecognizedItemRepository.retrieve(id);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  res.status(200).json({ data: item });
});

exports.createUnrecognizedItem = catchAsync(async (req, res, next) => {
  const item = await unrecognizedItemRepository.create(req.body);
  res.status(201).json(item);
});

exports.updateUnrecognizedItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await unrecognizedItemRepository.put(id, req.body);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  res.status(200).json(item);
});

exports.deleteUnrecognizedItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await unrecognizedItemRepository.delete(id);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  res.status(204).json(null);
});

