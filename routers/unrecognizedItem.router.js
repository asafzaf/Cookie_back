const express = require("express");
const authController = require("../controllers/auth.controller");
const unrecognizedItemController = require("../controllers/unrecognizedItem.controller");

const router = express.Router();

router.get(
  "/",
  authController.protect,
  unrecognizedItemController.getAllUnrecognizedItems
);
router.get(
  "/:id",
  authController.protect,
  unrecognizedItemController.getUnrecognizedItem
);
router.post(
  "/",
  authController.protect,
  unrecognizedItemController.createUnrecognizedItem
);
router.put(
  "/:id",
  authController.protect,
  unrecognizedItemController.updateUnrecognizedItem
);
router.delete(
  "/:id",
  authController.protect,
  unrecognizedItemController.deleteUnrecognizedItem
);

router.post(
  "/:id/recognize",
  authController.protect,
  unrecognizedItemController.recognizeItem
);

module.exports = router;
