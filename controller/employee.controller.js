const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const employee = require('../models/employee.model.js');
const jwtSecret = 'dev-ipqn463hzjuhm4wx';

const employeeSchema = Joi.object({
    name : Joi.string()
                .pattern(new RegExp(/^[A-Za-z]+( [A-Za-z]+)*$/))
                .required()
                .messages({
                            "string.empty": "Name cannot be empty.",
                            "string.pattern.base": "name cannot contain numbers , special characters and multiple spaces."
                }),
    email : Joi.string()
                .email()
                .required()
                .messages({
                            "string.empty": "Email cannot be empty.",
                            "string.email": "Invalid email format." 
                }),
    password: Joi.string()
                .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/))
                .required()
                .messages({
                    "string.empty": "Password cannot be empty.",
                    "string.pattern.base": "Password must contain 1 Uppercase letter , 1 lowercase letter , 1 digit , 1 special character.Password length must be minimum 8 and maximum 10 characters."
                })
});

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

        if(result.error){
            res.status(400).json({message : result.error.message});
        }else{
            const emailExists = await employee.findOne({ email: reqEmp.email });
            if(emailExists){
                res.status(400).json({message : "Email already exists"});
            }else{
                const salt = await bcrypt.genSalt(10);
                let encryptedPass = await bcrypt.hash(reqEmp.password, salt);
                let empJson = req.body;
                empJson.password = encryptedPass;
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
            if(emailExists){
                res.status(400).json({message : "Email already exists"});
            }else{
                const salt = await bcrypt.genSalt(10);
                let encryptedPass = await bcrypt.hash(reqEmp.password, salt);
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
        const id = req.params.id;
        const password = req.params.password;
        const emp = await employee.findById(id);
        if(emp){
            const checkPass = await bcrypt.compare(password,emp.password);
            return res.status(200).json({isCorrectPass : checkPass});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const generateToken = async (req, res) => {
    try{
        let id = req.params.id;
        const emp = await employee.findById(id);
        if(emp){
            let payload = { 
                id : id 
            }
            const token = jwt.sign(payload, jwtSecret, {
                expiresIn: 86400 
            });
            return res.status(200).json({token : token});
        }else{
            return res.status(200).json({message : "User not found"});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
}

const userLogin = async(req, res) => {
    const id = req.body.id;
    const password = req.body.password; 
    const emp = await employee.findById(id);

    if(!emp){
        return res.status(404).json({message:"User not found"});
    }

    const isValidPass = bcrypt.compareSync(password,emp.password);
    if(!isValidPass){
        return res.status(404).json({message : "Invalid Password"});
    }
    let payload = { 
        id : id 
    }
    const token = jwt.sign(payload, jwtSecret, {
        expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE_REFRESH) 
    });
    return res.status(200).json({token : token});
    
}

const veriftToken = (req,res,next)=>{
    try{
        const token = req.headers['access-token'];
        const id = req.params.id;
        if(!token){
            return res.status(400).json({message:"token is required"});
        }
        jwt.verify(token,jwtSecret,(err,decoded)=>{
            if(err) {
                return res.status(500).json({message : "Failed to verify token."})
            }
            if(id != decoded.id){
                return res.status(403).json({message : "You are not authorized to access this API."});
            }
            next();
        });
    }catch(err){
        return res.status(500).json({message : err.message});
    }
}

module.exports = {
    getEmployees,
    getEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    checkPassword,
    generateToken,
    veriftToken,
    userLogin
};