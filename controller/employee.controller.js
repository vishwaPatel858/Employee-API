const Joi = require("joi");
const {
  getEmployeesData,
  getEmployeeData,
  createEmployee,
  updateEmployeeData,
  deleteEmployeeData,
  validatePassword,
  tokenGenerate,
  testLogin,
  tokenVerification,
} = require("../service/employee.service.js");

const employeeSchema = Joi.object({
  name: Joi.string()
    .pattern(new RegExp(/^[A-Za-z]+( [A-Za-z]+)*$/))
    .required()
    .messages({
      "string.empty": "Name cannot be empty.",
      "string.pattern.base":
        "name cannot contain numbers , special characters and multiple spaces.",
    }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email cannot be empty.",
    "string.email": "Invalid email format.",
  }),
  password: Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/
      )
    )
    .required()
    .messages({
      "string.empty": "Password cannot be empty.",
      "string.pattern.base":
        "Password must contain 1 Uppercase letter , 1 lowercase letter , 1 digit , 1 special character.Password length must be minimum 8 and maximum 10 characters.",
    }),
});

const getEmployees = async (req, res) => {
  try {
    const response = await getEmployeesData();
    res.status(response.status).json(response);
    /*
      getEmployeesData().then((response)=>{
        res.status(response.status).json(response);  
      }).catch((error)=>{res.status(error.status).json(error.message})
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    if (id === undefined || id === null) {
      return res.status(404).json({ message: "Please Provide Id." });
    }
    const response = await getEmployeeData(id);
    res.status(response.status).json(response);
    /*
    getEmployeeData(id).then((response) => res.status(response.status).json(response))
    .catch((err) => res.status(err.status).json(err.message));
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addEmployee = async (req, res) => {
  try {
    let reqEmp = req.body;
    let { name, email, password } = req.body;
    const result = await employeeSchema.validate({
      name: name,
      email: email,
      password: password,
    });

    if (result.error) {
      res.status(400).json({ message: result.error.message });
    }
    const response = await createEmployee(reqEmp);
    res.status(response.status).json(response);
    /** 
     createEmployee(reqEmp)
     .then((response)=>res.status(response.status).json(response))
     .catch((err)=>res.status(err.status).json(err));
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let reqEmp = req.body;
    let { name, email, password } = req.body;
    const result = await employeeSchema.validate({
      name: name,
      email: email,
      password: password,
    });
    if (result.error) {
      res.status(400).json({ message: result.error.message });
    }
    const response = await updateEmployeeData(id, reqEmp);
    res.status(response.status).json(response);
    /** 
     updateEmployeeData(id, reqEmp).then((response)=>{
        res.status(response.status).json(response);
      }).catch((err)=>{
        res.status(err.status).json(err.message);
      });
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteEmployeeData(id);
    res.status(response.status).json(response);
    /** 
     deleteEmployeeData(id).then((response) => {
      res.status(response.status).json(response}).catch((err) => {
        res.status(err.status).json(err));  
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkPassword = async (req, res) => {
  try {
    let { id, password } = req.params;
    const response = await validatePassword(id, password);
    res.status(response.status).json(response);
    /** 
     validatePassword(id, password).then((response)=>{
      res.status(response.status).json(response);
      }).catch((err)=>{
        res.status(500).json({ message: err.message });});
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateToken = async (req, res) => {
  try {
    let { id } = req.params;
    const response = await tokenGenerate(id);
    res.status(response.status).json(response);
    /** 
     tokenGenerate(id).then((response) =>{
      res.status(response.status).json(response);
    }).catch((err) =>{
      res.status(500).json({ message: err.message });  
    });
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { id, password } = req.body;
    const response = await testLogin(id, password);
    res.status(response.status).json(response);
    /** 
     testLogin(id, password).then((response) => {
      res.status(response.status).json(response);
    }).catch((err) =>{
      res.status(500).json({ message: err.message });
      });
    */
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const veriftToken = async (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    const id = req.params.id;
    if (!token) {
      return res.status(400).json({ message: "token is required" });
    }
    const response = await tokenVerification(id, token);
    if (response.status !== 200) {
      return res.status(response.status).json(response);
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  checkPassword,
  generateToken,
  veriftToken,
  userLogin,
};
