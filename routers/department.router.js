const express = require("express");
const DepartmentController = require("../controllers/department.controller");
const router = express.Router();

router.get("/", DepartmentController.getAllDepartments);
router.get("/:id", DepartmentController.getDepartment);
router.post("/", DepartmentController.createDepartment);
router.put("/:id", DepartmentController.updateDepartment);
router.delete("/:id", DepartmentController.deleteDepartment);

module.exports = router;