const express = require("express");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/", authController.protect, userController.getAllUsers);
router.get("/:id", authController.protect, userController.getUser);
router.post("/", authController.protect, userController.createUser);
router.put("/:id", authController.protect, userController.updateUser);
router.delete("/:id", authController.protect, userController.deleteUser);
router.put(
  "/:id/language",
  authController.protect,
  userController.changeLanguage
);

module.exports = router;
