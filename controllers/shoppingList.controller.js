const shoppingListRepository = require("../repositories/shoppingList.repository");
const shoppingHistoryItemRepository = require("../repositories/shoppingHistoryItem.repository");
const departmentRepository = require("../repositories/department.repository");
const userRepository = require("../repositories/user.repository");
const messageRepository = require("../repositories/message.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");

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
    .populate({
      path: "pendingUsers",
      model: "user",
    })
    .lean();
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  res.status(200).json({ data: shoppingList });
});

exports.getOrderedShoppingList = catchAsync(async (req, res, next) => {
  console.log("Got request to get ordered shopping list");
  const { id } = req.params;
  const shoppingList = await shoppingListRepository
    .retrieve({ _id: id })
    .populate({
      path: "items.item",
      model: "item",
      populate: { path: "department", model: "department" }, // Populate department details for items
    })
    .populate({
      path: "unrecognizedItems.item",
      model: "unrecognized.item",
    })
    .populate({ path: "users", model: "user" })
    .populate({ path: "admins", model: "user" })
    .populate({ path: "pendingUsers", model: "user" })
    .lean();
  // console.log("shoppingList", shoppingList);
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }

  // Organize items by department
  const itemsByDepartment = {};

  shoppingList.items.forEach(({ item, quantity }) => {
    const departmentName = item.department?.name || "Uncategorized";
    const departmentId = item.department?._id || "Uncategorized";
    // console.log("departmentName", departmentName);
    // console.log("departmentId", departmentId);
    if (!itemsByDepartment[departmentId]) {
      itemsByDepartment[departmentId] = {};
      itemsByDepartment[departmentId]["name"] = departmentName;
      itemsByDepartment[departmentId]["id"] = departmentId;
      itemsByDepartment[departmentId]["items"] = [];
    }
    itemsByDepartment[departmentId].items.push({ item, quantity });
  });

  // console.log("itemsByDepartment", itemsByDepartment);

  // Collect unrecognized items under a separate label
  const unrecognizedItems = shoppingList.unrecognizedItems.map(({ item }) => ({
    item,
    quantity: 1,
  }));

  console.log("unrecognizedItems", unrecognizedItems);

  // Convert itemsByDepartment to an array for easier handling on the frontend
  const orderedList = Object.entries(itemsByDepartment).map(
    ([departmentId, { name, items }]) => ({
      department: name,
      items,
      id: departmentId,
    })
  );

  // Include unrecognized items as a separate department-like entry
  orderedList.push({
    department: {
      heb: "לא מזוהים",
      en: "Unrecognized",
    },
    id: "unr555",
    items: unrecognizedItems,
  });

  // itemsByDepartment["Unrecognized Items"] = {
  //   id: "Unrecognized",
  //   items: shoppingList.unrecognizedItems.map(({ item }) => item),
  // };

  shoppingList["items"] = null;

  shoppingList["orededData"] = orderedList;

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

exports.updateLiveShoppingList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId, departments, totalPrice } = req.body;
  console.log("Got request to update live shopping list");
  console.log("id", id);
  console.log("userId", userId);
  const shoppingList = await shoppingListRepository.retrieve(id);
  if (!shoppingList) {
    return next(new NotFoundError(`Shopping list with id ${id} not found`));
  }
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }

  const unrecognizedDepartmentIndex = departments.findIndex(
    (department) => department.id === "unr555"
  );
  let unrecognizedItems = [];
  if (unrecognizedDepartmentIndex !== -1) {
    unrecognizedItems = departments[unrecognizedDepartmentIndex].items.filter(
      (item) => item.checked
    );
    departments.splice(unrecognizedDepartmentIndex, 1);
  }

  const checkedItems = departments.reduce((acc, department) => {
    return acc.concat(department.items.filter((item) => item.checked));
  }, []);

  console.log("checkedItems", checkedItems);
  console.log("unrecognizedItems", unrecognizedItems);
  // Add checked items to shopping history
  const shoppingHistoryItem = await shoppingHistoryItemRepository.create({
    listId: id,
    byUser: userId,
    items: checkedItems,
    totalPrice: totalPrice,
    unrecognizedItems: unrecognizedItems,
  });

  // Update shopping list last buy date

  shoppingList.lastBuy = new Date();

  shoppingList.items = shoppingList.items.filter((item) => {
    return !checkedItems.find(
      (checkedItem) =>
        checkedItem.item._id.toString() === item.item._id.toString()
    );
  });

  shoppingList.unrecognizedItems = shoppingList.unrecognizedItems.filter(
    (item) => {
      return !unrecognizedItems.find(
        (unrecognizedItem) =>
          unrecognizedItem.item._id.toString() === item.item._id.toString()
      );
    }
  );

  await shoppingList.save();

  res.status(200).json({ data: shoppingHistoryItem });
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
    // console.log("found");
    shoppingList.items[itemIndex].quantity += 1;
  } else {
    // console.log("not found");
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
  // console.log(resItem);

  res.status(200).json(resItem);
});

exports.addUnrecognizedItemToShoppingList = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const item = req.body.item;
    // console.log("item", item);
    const shoppingList = await shoppingListRepository.retrieve({
      _id: id,
    });
    // console.log("shopping list", shoppingList);
    if (!shoppingList) {
      return next(new NotFoundError(`Shopping list with id ${id} not found`));
    }
    const itemIndex = shoppingList.unrecognizedItems.findIndex(
      (m_item) => m_item.item.toString() === item.toString()
    );
    if (itemIndex !== -1) {
      // console.log("found");
      shoppingList.unrecognizedItems[itemIndex].quantity += 1;
    } else {
      // console.log("not found");
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

    // console.log("item0:", newData.unrecognizedItems[0]);
    const resItem = newData.unrecognizedItems.find(
      (m_item) => m_item.item._id.toString() === item.toString()
    );
    // console.log("resITem", resItem);
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
    // console.log("resItem", resItem);
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
  const { selfId, userEmail, listId } = req.body;
  console.log("req.body", req.body);
  const user = await userRepository.findByMail({ email: userEmail });
  if (!user) {
    console.log(`User with email ${userEmail} not found`);
    return next(new NotFoundError(`User with email ${userEmail} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  list.pendingUsers.push(user._id);
  user.pendingShoppingLists.push(listId);
  const message = await messageRepository.create({
    userId: user._id,
    sender: selfId,
    recipient: user._id,
    title: "Shopping list invitation",
    message: `You have been invited to join the shopping list ${list.name}`,
    type: "invitation",
    attachments: [`listId: ${listId}`],
  });
  await list.save();
  await user.save();
  res.status(200).json(user);
});

exports.acceptUserToShoppingList = catchAsync(async (req, res, next) => {
  const { userId, listId } = req.body;
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  const searchIndex = list.users.indexOf(userId);
  if (searchIndex !== -1) {
    return next(new BadRequestError("User already in list"));
  }
  const userIndex = list.pendingUsers.indexOf(userId);
  if (userIndex !== -1) {
    list.pendingUsers.splice(userIndex, 1);
  }
  list.users.push(userId);
  await list.save();
  const listIndex = user.pendingShoppingLists.indexOf(listId);
  if (listIndex !== -1) {
    user.pendingShoppingLists.splice(listIndex, 1);
  }
  user.shoppingLists.push(listId);
  await user.save();
  res.status(200).json(list);
});

exports.rejectUserToShoppingList = catchAsync(async (req, res, next) => {
  const { userId, listId } = req.body;
  const user = await userRepository.retrieve({ _id: userId });
  if (!user) {
    return next(new NotFoundError(`User with id ${userId} not found`));
  }
  const list = await shoppingListRepository.retrieve({ _id: listId });
  if (!list) {
    return next(new NotFoundError(`Shopping list with id ${listId} not found`));
  }
  const userIndex = list.pendingUsers.indexOf(userId);
  if (userIndex !== -1) {
    list.pendingUsers.splice(userIndex, 1);
  }
  await list.save();
  const listIndex = user.pendingShoppingLists.indexOf(listId);
  if (listIndex !== -1) {
    user.pendingShoppingLists.splice(listIndex, 1);
  }
  await user.save();
  res.status(200);
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
