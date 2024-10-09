const express = require("express");
const userRouter = require("./user.router");
const itemRouter = require("./item.router");
const shoppingListRouter = require("./shoppingList.router");
const unrecognizedItemRouter = require("./unrecognizedItem.router");

const router = express.Router();

router.use("/api/v1/user", userRouter);
router.use("/api/v1/item", itemRouter);
router.use("/api/v1/shoppinglist", shoppingListRouter);
router.use("/api/v1/unrecognizeditem", unrecognizedItemRouter);


module.exports = router;