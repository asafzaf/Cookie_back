const express = require("express");
const shoppingListController = require("../controllers/shoppingList.controller");

const router = express.Router();

router.get("/", shoppingListController.getAllShoppingLists);
router.get("/:id", shoppingListController.getShoppingList);
router.post("/", shoppingListController.createShoppingList);
router.post("/:id/add", shoppingListController.addItemToShoppingList);
router.post(
  "/:id/addUnrecognized",
  shoppingListController.addUnrecognizedItemToShoppingList
);
router.post("/:id/remove", shoppingListController.removeItemFromShoppingList);
router.post(
  "/:id/removeUnrecognized",
  shoppingListController.removeUnrecognizedItemFromShoppingList
);
router.put("/:id", shoppingListController.updateShoppingList);
router.delete("/:id", shoppingListController.deleteShoppingList);
router.post("/setDefault", shoppingListController.setDefaultShoppingList);
router.post("/addUser", shoppingListController.addUserToShoppingList);
router.post("/removeUser", shoppingListController.removeUserFromShoppingList);
router.post("/addAdmin", shoppingListController.addAdminToShoppingList);
router.post("/removeAdmin", shoppingListController.removeAdminFromShoppingList);

module.exports = router;
