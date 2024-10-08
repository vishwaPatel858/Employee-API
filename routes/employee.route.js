const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  checkPassword,
  generateToken,
  veriftToken,
  userLogin,
} = require("../controller/employee.controller.js");

router.get("/", getEmployees);
router.get("/:id", getEmployee);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.get("/:id/:password", checkPassword);
router.get("/token/generate/:id", generateToken);
router.get("/token/verify/:id", veriftToken, getEmployee);
router.post("/userLogin", userLogin);

module.exports = router;
