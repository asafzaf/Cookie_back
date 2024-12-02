const express = require("express");
const generalController = require("../controllers/general.controller");
const router = express.Router();

// router.get("/", generalController.getGeneralInfo);
router.get("/health", generalController.checkHealth);

module.exports = router;