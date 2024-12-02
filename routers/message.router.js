const express = require("express");
const messageController = require("../controllers/message.controller");
const router = express.Router();

router.get("/", messageController.getAllMessages);
router.get("/:id", messageController.getMessage);
router.post("/", messageController.createMessage);
router.put("/:id", messageController.updateMessage);
router.delete("/:id", messageController.deleteMessage);
router.get("/user/:id", messageController.getMessagesByUserId);

module.exports = router;