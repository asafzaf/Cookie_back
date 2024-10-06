const shoppingListRepository = require("../repositories/shoppingList.repository");
const userRepository = require("../repositories/user.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");
const { path } = require("express/lib/application");
const { model } = require("mongoose");

exports.getAllShoppingLists = catchAsync(async (req, res, next) => {
  const shoppingLists = await shoppingListRepository.find();
  if (!shoppingLists || shoppingLists.length === 0) {
    return next(new NotFoundError("No shopping lists found"));
  }
  res.status(200).json({
    results: shoppingLists.length,
    data: [...shoppingLists],
  });
});

exports.getShoppingList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const shoppingList = await shoppingListRepository
    .retrieve({
      _id: id,
    })
    .populate({
      path: "items.item",
      model: "item",
    })
    .lean();
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  res.status(200).json({ data: shoppingList });
});

exports.createShoppingList = catchAsync(async (req, res, next) => {
  const new_list = await shoppingListRepository.create(req.body);
  const { userId } = req.body;
  new_list.admins.push(userId);
  await new_list.save();
  const { id } = new_list;
  const user = await userRepository.retrieve({ _id: userId });
  user.shoppingLists.push(id);
  await user.save();
  if (!new_list) {
    return next(new BadRequestError("Invalid data"));
  }
  res.status(201).json(new_list);
});

exports.updateShoppingList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const shoppingList = await shoppingListRepository.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  res.status(200).json(shoppingList);
});

exports.deleteShoppingList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const shoppingList = await shoppingListRepository.findByIdAndDelete(id);
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  res.status(204).json(null);
});

exports.addItemToShoppingList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = req.body.item;
  console.log(item);
  const shoppingList = await shoppingListRepository.retrieve({
    _id: id,
  });
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  console.log(shoppingList.items);
  const itemIndex = shoppingList.items.findIndex(
    (m_item) => m_item.item.toString() === item.toString()
  );
  if (itemIndex !== -1) {
    console.log("found");
    shoppingList.items[itemIndex].quantity += 1;
  } else {
    console.log("not found");
    shoppingList.items.push({ item, quantity: 1 });
  }
  await shoppingList.save();
  res.status(200).json(shoppingList);
});

exports.removeItemFromShoppingList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = req.body.item;
  const shoppingList = await shoppingListRepository.retrieve({
    _id: id,
  });
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  const itemIndex = shoppingList.items.findIndex(
    (m_item) => m_item.item.toString() === item.toString()
  );
  if (itemIndex !== -1) {
    shoppingList.items[itemIndex].quantity -= 1;
    if (shoppingList.items[itemIndex].quantity === 0) {
      shoppingList.items.splice(itemIndex, 1);
    }
  }
  await shoppingList.save();
  res.status(200).json(shoppingList);
});
