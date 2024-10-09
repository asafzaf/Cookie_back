const express = require('express');
const unrecognizedItemController = require('../controllers/unrecognizedItem.controller');

const router = express.Router();

router.get('/', unrecognizedItemController.getAllUnrecognizedItems);
router.get('/:id', unrecognizedItemController.getUnrecognizedItem);
router.post('/', unrecognizedItemController.createUnrecognizedItem);
router.put('/:id', unrecognizedItemController.updateUnrecognizedItem);
router.delete('/:id', unrecognizedItemController.deleteUnrecognizedItem);

module.exports = router;