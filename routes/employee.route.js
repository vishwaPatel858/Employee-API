const express = require('express');
const {getEmployees , getEmployee , addEmployee ,updateEmployee ,deleteEmployee} = require('../controller/employee.controller.js');

const router = express.Router();

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;