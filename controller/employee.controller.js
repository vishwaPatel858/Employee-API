const Joi = require('joi');
const bcrypt = require('bcrypt');
const employee = require('../models/employee.model.js');

const employeeSchema = Joi.object({
    name : Joi.string()
            .pattern(new RegExp('^[a-zA-Z ]+$'))
            .required()
            .messages({
        "string.empty": "Name cannot be empty.",
        "string.pattern.base": "name cannot contain numbers or special characters."
    }),
    email : Joi.string()
                .email()
                .required()
                .messages({
        "string.empty": "Email cannot be empty.",
        "string.email": "Invalid email format."
    }),
    password : Joi.string()
                    
                    .required()
                    .messages({
        "string.empty": "Password cannot be empty.",
        "string.pattern.base": "Password must contain one Uppercase letter , one lowercase letter , one special character and one number. Minimum length should be 8 and maximum length is 10.",
    })
});
//.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$'))
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
        const result = await employeeSchema.validate({
            name: reqEmp.name != null ? reqEmp.name : '', 
            email: reqEmp.email != null ? reqEmp.email : ''  , 
            password : reqEmp.password != null ? reqEmp.password : ''
        });
        console.log(reqEmp.password);
        if(result.error){
            console.log(result.error.message);
            res.status(400).json({message : result.error.message});
        }else{
            const emailExists = await employee.findOne({ email: reqEmp.email });
            console.log(emailExists);
            if(emailExists){
                res.status(400).json({message : "Email already exists"});
            }else{
                const salt = await bcrypt.genSalt(10);
                console.log(salt + " :::::::::::::::salt");
                let encryptedPass = await bcrypt.hash(reqEmp.password, salt);
                console.log(encryptedPass);
                let empJson = req.body;
                empJson.password = encryptedPass;
                console.log(empJson);
                /*const checkPass = await bcrypt.compare('Atharv@456',encryptedPass);
                console.log("checkPass : " + checkPass);*/
                const emp = await employee.create(empJson);
                res.status(200).json(emp);
            }
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const updateEmployee =  async (req, res) => {
    try{
        const {id} = req.params;
        let reqEmp = req.body;
        const result = await employeeSchema.validate({
            name: reqEmp.name != null ? reqEmp.name : '', 
            email: reqEmp.email != null ? reqEmp.email : ''  , 
            password : reqEmp.password != null ? reqEmp.password : ''
        });
        if(result.error){
            res.status(400).json({message : result.error.message});
        }else{
            const emailExists = await employee.findOne({ email: reqEmp.email , _id: {$ne: id} });
            console.log(emailExists);
            if(emailExists){
                res.status(400).json({message : "Email already exists"});
            }else{
                const salt = await bcrypt.genSalt(10);
                console.log(salt + " :::::::::::::::salt");
                let encryptedPass = await bcrypt.hash(reqEmp.password, salt);
                console.log(encryptedPass);
                let empJson = req.body;
                empJson.password = encryptedPass;
                const emp = await employee.findByIdAndUpdate(id,empJson);
                if(!emp){
                    return res.status(404).json({message : 'Employee not found'});
                }
                const updatedEmp = await employee.findById(id);
                res.status(200).json(updatedEmp);
            }
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

const checkPassword = async (req, res) => {
    try{
        console.log('Check Password');
        const id = req.params.id;
        console.log(id);
        const password = req.params.password;
        const emp = await employee.findById(id);
        if(emp){
            const checkPass = await bcrypt.compare(password,emp.password);
            console.log("checkPass : " + checkPass);
            return res.status(200).json({isCorrectPass : checkPass});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
}
module.exports = {
    getEmployees,
    getEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    checkPassword
};