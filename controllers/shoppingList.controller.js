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
    .populate({
      path: "unrecognizedItems.item",
      model: "unrecognized.item",
    })
    .populate({
      path: "users",
      model: "user",
    })
    .populate({
      path: "admins",
      model: "user",
    })
    .lean();
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  res.status(200).json({ data: shoppingList });
});

exports.createShoppingList = catchAsync(async (req, res, next) => {
  const { userId, name } = req.body;
  const new_list = await shoppingListRepository.create({ name });
  new_list.admins.push(userId);
  new_list.users.push(userId);
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

  const newData = await shoppingListRepository
    .retrieve({
      _id: id,
    })
    .populate({
      path: "items.item",
      model: "item",
    })
    .lean();

  const resItem = newData.items.find(
    (m_item) => m_item.item._id.toString() === item.toString()
  );
  console.log(resItem);

  res.status(200).json(resItem);
});

exports.addUnrecognizedItemToShoppingList = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const item = req.body.item;
    console.log("item", item);
    const shoppingList = await shoppingListRepository.retrieve({
      _id: id,
    });
    console.log("shopping list", shoppingList);
    if (!shoppingList) {
      return next(new NotFoundError(`Shopping list with id ${id} not found`));
    }
    const itemIndex = shoppingList.unrecognizedItems.findIndex(
      (m_item) => m_item.item.toString() === item.toString()
    );
    if (itemIndex !== -1) {
      console.log("found");
      shoppingList.unrecognizedItems[itemIndex].quantity += 1;
    } else {
      console.log("not found");
      shoppingList.unrecognizedItems.push({ item, quantity: 1 });
    }
    await shoppingList.save();

    const newData = await shoppingListRepository
      .retrieve({
        _id: id,
      })
      .populate({
        path: "unrecognizedItems.item",
        model: "unrecognized.item",
      })
      .lean();

    console.log("item0:", newData.unrecognizedItems[0]);
    const resItem = newData.unrecognizedItems.find(
      (m_item) => m_item.item._id.toString() === item.toString()
    );
    console.log("resITem", resItem);
    res.status(200).json(resItem);
  }
);

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

  const newData = await shoppingListRepository
    .retrieve({
      _id: id,
    })
    .populate({
      path: "items.item",
      model: "item",
    })
    .lean();

  let resItem = newData.items.find(
    (m_item) => m_item.item._id.toString() === item.toString()
  );
  if (!resItem) {
    resItem = null;
  }
  res.status(200).json(resItem);
});

exports.removeUnrecognizedItemFromShoppingList = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const item = req.body.item;
    const shoppingList = await shoppingListRepository.retrieve({
      _id: id,
    });
    if (!shoppingList) {
      return next(new NotFoundError(`Shopping list with id ${id} not found`));
    }
    const itemIndex = shoppingList.unrecognizedItems.findIndex(
      (m_item) => m_item.item.toString() === item.toString()
    );
    if (itemIndex !== -1) {
      shoppingList.unrecognizedItems[itemIndex].quantity -= 1;
      if (shoppingList.unrecognizedItems[itemIndex].quantity === 0) {
        shoppingList.unrecognizedItems.splice(itemIndex, 1);
      }
    }

    await shoppingList.save();

    const newData = await shoppingListRepository
      .retrieve({
        _id: id,
      })
      .populate({
        path: "unrecognizedItems.item",
        model: "unrecognized.item",
      });
    let resItem = newData.unrecognizedItems.find(
      (m_item) => m_item.item._id.toString() === item.toString()
    );
    if (!resItem) {
      resItem = null;
    }
    console.log("resItem", resItem);
    res.status(200).json(resItem);
  }
);

exports.setDefaultShoppingList = catchAsync(async (req, res, next) => {
  const { userId, listId } = req.body;
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  user.default_shopping_list = listId;
  await user.save();
  res.status(200).json(user);
});

exports.addUserToShoppingList = catchAsync(async (req, res, next) => {
  const { userEmail, listId } = req.body;
  const user = await userRepository.retrieve({ email: userEmail });
  if (!user) {
    return next(new NotFoundError(`User with email ${userEmail} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  list.users.push(user._id);
  await list.save();
  user.shoppingLists.push(listId);
  await user.save();
  res.status(200).json(list);
});

exports.removeUserFromShoppingList = catchAsync(async (req, res, next) => {
  const { userId, listId } = req.body;
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  const userIndex = list.users.indexOf(userId);
  if (userIndex !== -1) {
    list.users.splice(userIndex, 1);
  }
  const adminIndex = list.admins.indexOf(userId);
  if (adminIndex !== -1) {
    list.admins.splice(adminIndex, 1);
  }
  await list.save();
  const listIndex = user.shoppingLists.indexOf(listId);
  if (listIndex !== -1) {
    user.shoppingLists.splice(listIndex, 1);
  }
  await user.save();
  res.status(200).json(list);
});

exports.addAdminToShoppingList = catchAsync(async (req, res, next) => {
  const { userId, listId } = req.body;
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  list.admins.push(userId);
  await list.save();
  res.status(200).json(list);
});

exports.removeAdminFromShoppingList = catchAsync(async (req, res, next) => {
  const { userId, listId } = req.body;
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  const userIndex = list.admins.indexOf(userId);
  if (userIndex !== -1) {
    list.admins.splice(userIndex, 1);
  }
  await list.save();
  res.status(200).json(list);
});
