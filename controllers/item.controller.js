const itemRepository = require("../repositories/item.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");

exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await itemRepository.find();
  if (!items || items.length === 0) {
    return next(new NotFoundError("No items found"));
  }
  res.status(200).json({
    results: items.length,
    data: [...items],
  });
});

exports.getItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await itemRepository.retrieve(id);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  res.status(200).json({ data: item });
});

exports.createItem = catchAsync(async (req, res, next) => {
  const item = await itemRepository.create(req.body);
  res.status(201).json(item);
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await itemRepository.put(id, req.body);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  res.status(200).json(item);
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await itemRepository.delete(id);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  res.status(204).json(null);
});
