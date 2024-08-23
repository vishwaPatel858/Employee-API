const employee = require('../models/employee.model.js');

const getEmployees = async (req, res) => {
    try{
        const emp = await employee.find({});
        res.status(200).json(emp);
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const getEmployee = async (req, res) => {
    try{
        const {id} = req.params;
        const emp = await employee.findById(id);
        if(!emp){
            return res.status(404).json({message : 'Employee not found'});
        }
        res.status(200).json(emp);
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const addEmployee = async (req, res) => {
    try{
        let reqEmp = req.body;
        let regex  =  /^[a-zA-Z]+$/;
        if(reqEmp != null && reqEmp.name != null && regex.test(reqEmp.name) ){
            const emp = await employee.create(req.body);
            res.status(200).json(emp);
        }else{
            res.status(400).json({message : 'Invalid employee name'});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const updateEmployee =  async (req, res) => {
    try{
        const {id} = req.params;
        let reqEmp = req.body;
        let regex  =  /^[a-zA-Z]+$/;
        if(reqEmp != null && reqEmp.name != null && regex.test(reqEmp.name)) {
            const emp = await employee.findByIdAndUpdate(id,req.body);
            if(!emp){
                return res.status(404).json({message : 'Employee not found'});
            }
            const updatedEmp = await employee.findById(id);
            res.status(200).json(updatedEmp);
        }else{
            res.status(400).json({message : 'Invalid Employee name'});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const deleteEmployee = async(req, res) =>{
    try{
        const {id} = req.params;
        const emp = await employee.findByIdAndDelete(id);
        if(!emp){
            return res.status(404).json({message : 'Employee not found'});
        }
        res.status(200).json({message : "Employee Deleted Successfully"});
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

module.exports = {
    getEmployees,
    getEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee
};