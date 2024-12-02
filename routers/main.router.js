const express = require("express");
const generalRouter = require("./general.router");
const userRouter = require("./user.router");
const itemRouter = require("./item.router");
const shoppingListRouter = require("./shoppingList.router");
const unrecognizedItemRouter = require("./unrecognizedItem.router");
const messageRouter = require("./message.router");

const router = express.Router();

router.use("/api/v1/general", generalRouter);
router.use("/api/v1/user", userRouter);
router.use("/api/v1/item", itemRouter);
router.use("/api/v1/shoppinglist", shoppingListRouter);
router.use("/api/v1/unrecognizeditem", unrecognizedItemRouter);
router.use("/api/v1/message", messageRouter);

module.exports = router;
