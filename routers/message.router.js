const express = require("express");
const authController = require("../controllers/auth.controller");
const messageController = require("../controllers/message.controller");
const router = express.Router();

router.get("/", authController.protect, messageController.getAllMessages);
router.get("/:id", authController.protect, messageController.getMessage);
router.post("/", authController.protect, messageController.createMessage);
router.put("/:id", authController.protect, messageController.updateMessage);
router.delete("/:id", authController.protect, messageController.deleteMessage);
router.get(
  "/user/:id",
  authController.protect,
  messageController.getMessagesByUserId
);

module.exports = router;
