const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const joi = require("joi");
const employee = require("../models/employee.model.js");
const redisClient = require("../redisClient.js");
redisClient.connect();
const loginValidationSchema = joi.object({
  id: joi.string().required().messages({
    "string.empty": "Name can't be empty",
  }),
  password: joi
    .string()
    .required()
    .messages({ "string.empty": "Password cannot be empty." }),
});
const login = async (req, res) => {
  try {
    const { id, password } = req.body;
    const validate = loginValidationSchema.validate({id : id, password : password});
    if(validate.error){
      return res.status(500).json({message : error.message})
    }
    const emp = await employee.findById(id);
    if (!emp) {
      return res.status(404).json({ message: "Employee not found." });
    }
    const isValidPass = bcrypt.compare(password, emp.password);
    if (!isValidPass) {
      return res.status(505).json({ message: "Invalid Password" });
    }
    let payload = {
      id: id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 3600
    });
    await redisClient.set(id, token, "EX", 3600);
    return res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const authenticate = async (req, res, next) => {
  try {
    const id = req.body.id;
    const token = req.headers["access-token"];
    const redisToken = await redisClient.get(id,(err)=>{
      if(err) {
        return res.status(500).json({ message: err.message });
      }
    });
    console.log(redisToken);
    if (token !== redisToken) {
      return res.status(500).json({ message: "Invalid Token" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const generateTokenWithPayload = async (req, res) => {
  const ipToken = req.headers.authorization;
  console.log(ipToken);
  const payload = {
    id: 12233,
    name: "test token",
    pincode: 396001,
  };
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
  res.status(200).json({ token });
};

const logout = (req, res) => {
  const id = req.params.id;
  if(id === null || id === undefined){
    return res.status(404).json({message : "Id required"});
  }
  redisClient.del(id,(err)=>{
    if(err){
      return res.status(500).json({message:err.message});
    }
  });
  res.status(200).json({message:"token data deleted"});
}
module.exports = {
  login,
  authenticate,
  generateTokenWithPayload,
  logout
};
