const express = require('express');
const shoppingListController = require('../controllers/shoppingList.controller');

const router = express.Router();

router.get('/', shoppingListController.getAllShoppingLists);
router.get('/:id', shoppingListController.getShoppingList);
router.post('/', shoppingListController.createShoppingList);
router.post('/:id/add', shoppingListController.addItemToShoppingList);
router.post('/:id/remove', shoppingListController.removeItemFromShoppingList);
router.put('/:id', shoppingListController.updateShoppingList);
router.delete('/:id', shoppingListController.deleteShoppingList);
router.post('/setDefault', shoppingListController.setDefaultShoppingList);

module.exports = router;
