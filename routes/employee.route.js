const express = require('express');
const {getEmployees , getEmployee , addEmployee ,updateEmployee ,deleteEmployee , checkPassword , generateToken , veriftToken } = require('../controller/employee.controller.js');
const router = express.Router();

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.get('/:id/:password', checkPassword);
router.get("/token/generate/:id", generateToken);
router.get('/token/verify/:id', veriftToken, getEmployee);

module.exports = router;