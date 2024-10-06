const express = require("express");
const userRouter = require("./user.router");
const itemRouter = require("./item.router");
const shoppingListRouter = require("./shoppingList.router");
const router = express.Router();

router.use("/api/v1/user", userRouter);
router.use("/api/v1/item", itemRouter);
router.use("/api/v1/shoppinglist", shoppingListRouter);

module.exports = router;