// const shoppingHistoryItemRepository = require("../repositories/shoppingHistoryItem.repository");
// const userRepository = require("../repositories/user.repository");
// const departmentRepository = require("../repositories/department.repository");
// const { BadRequestError, NotFoundError } = require("../errors/errors");
// const catchAsync = require("../utils/catch.async");

// exports.getAllShoppingHistoryItems = catchAsync(async (req, res) => {
//   const shoppingHistoryItems = await shoppingHistoryItemRepository.find();
//   res.status(200).json(shoppingHistoryItems);
// });

// exports.getShoppingHistoryItem = catchAsync(async (req, res) => {
//     const shoppingHistoryItem = await shoppingHistoryItemRepository.retrieve(req.params.id);
//     if (!shoppingHistoryItem) {
//         throw new NotFoundError("Shopping history item not found");
//     }
//     res.status(200).json(shoppingHistoryItem);
//     });

// exports.createShoppingHistoryItem = catchAsync(async (req, res) => {
//     const { userId, listId, items, totalPrice = 0 } = req.body;
//     const userExists = await userRepository.retrieve(userId);
//     if (!userExists) {
//         throw new BadRequestError("User not found");
//     }
//     const listExists = await shoppingListRepository.retrieve(listId);
//     if (!listExists) {
//         throw new BadRequestError("Shopping list not found");
//     }

   
// }
