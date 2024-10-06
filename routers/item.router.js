const express = require("express");
const itemController = require("../controllers/item.controller");
const router = express.Router();

router.get("/", itemController.getAllItems);
router.get("/:id", itemController.getItem);
router.post("/", itemController.createItem);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

module.exports = router;