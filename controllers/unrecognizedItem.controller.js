const unrecognizedItemRepository = require("../repositories/unrecognizedItem.repository");
const departmentRepository = require("../repositories/department.repository");
const itemRepository = require("../repositories/item.repository");
const shoppingListRepository = require("../repositories/shoppingList.repository");
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

exports.recognizeItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, departmentId } = req.body;
  const hebName = name.heb;
  const engName = name.en;

  const item = await unrecognizedItemRepository.retrieve(id);
  if (!item) {
    return next(new NotFoundError(`Item with id ${id} not found`));
  }
  if (!req.body.name) {
    return next(new BadRequestError("Name is required"));
  }
  if (!req.body.departmentId) {
    return next(new BadRequestError("Department is required"));
  }
  const department = await departmentRepository.retrieve(departmentId);
  if (!department) {
    return next(
      new NotFoundError(`Department with id ${departmentId} not found`)
    );
  }

  const newItem = {
    name: {
      heb: hebName,
      en: engName,
    },
    department: departmentId,
  };
  const createdItem = await itemRepository.create(newItem);
  const shoppingListsToUpdate = item.createOnList;
  shoppingListsToUpdate.forEach(async (listId) => {
    const shoppingList = await shoppingListRepository.retrieve(listId);

    const itemIndex = shoppingList.unrecognizedItems.findIndex(
      (item) => item.item.toString() === id
    );
    const itemObj = shoppingList.unrecognizedItems[itemIndex];
    shoppingList.unrecognizedItems.splice(itemIndex, 1);
    shoppingList.items.push({
      item: createdItem.id,
      quantity: itemObj.quantity,
    });
    await shoppingListRepository.put(listId, shoppingList);
  });
  await unrecognizedItemRepository.delete(id);
  res.status(200).json(createdItem);
});
