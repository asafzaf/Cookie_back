const express = require("express");
const authController = require("../controllers/auth.controller");
const DepartmentController = require("../controllers/department.controller");
const router = express.Router();

router.get("/", authController.protect, DepartmentController.getAllDepartments);
router.get("/:id", authController.protect, DepartmentController.getDepartment);
router.post("/", authController.protect, DepartmentController.createDepartment);
router.put(
  "/:id",
  authController.protect,
  DepartmentController.updateDepartment
);
router.delete(
  "/:id",
  authController.protect,
  DepartmentController.deleteDepartment
);

module.exports = router;
