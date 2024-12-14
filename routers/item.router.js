const express = require("express");
const authController = require("../controllers/auth.controller");
const itemController = require("../controllers/item.controller");
const router = express.Router();

router.get("/", authController.protect, itemController.getAllItems);
router.get("/:id", authController.protect, itemController.getItem);
router.post("/", authController.protect, itemController.createItem);
router.put("/:id", authController.protect, itemController.updateItem);
router.delete("/:id", authController.protect, itemController.deleteItem);

module.exports = router;
