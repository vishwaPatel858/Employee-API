const Employee = require("../models/employee.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const getEmployeesData = async () => {
  try {
    const employees = await Employee.find({});
    return {
      data: employees,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const getEmployeeData = async (id) => {
  try {
    const emp = await Employee.findById(id);
    if (!emp) {
      return {
        message: "Employee Not Found",
        status: 404,
      };
    }
    return {
      employee: emp,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const createEmployee = async (employee) => {
  try {
    const emailExists = await Employee.findOne({ email: employee.email });
    if (emailExists) {
      return {
        message: "Email already exists",
        status: 400,
      };
    }
    const salt = await bcrypt.genSalt(10);
    let encryptedPass = await bcrypt.hash(employee.password, salt);
    employee.password = encryptedPass;
    const emp = await Employee.create(employee);
    return {
      employee: emp,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const updateEmployeeData = async (id, employee) => {
  try {
    const emailExists = await Employee.findOne({
      email: employee.email,
      _id: { $ne: id },
    });
    if (emailExists) {
      return {
        message: "Email already exists",
        status: 400,
      };
    }
    const salt = await bcrypt.genSalt(10);
    let encryptedPass = await bcrypt.hash(employee.password, salt);
    employee.password = encryptedPass;
    const emp = await Employee.findByIdAndUpdate(id, employee);
    if (!emp) {
      return {
        message: "Employee not found",
        status: 404,
      };
    }
    const updatedEmp = await Employee.findById(id);
    return {
      employee: updatedEmp,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const deleteEmployeeData = async (id) => {
  try {
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return {
        message: "Employee not found",
        status: 404,
      };
    }
    return {
      message: "Employee deleted successfully",
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const validatePassword = async (id, password) => {
  try {
    const emp = await Employee.findById(id);
    if (!emp) {
      return {
        message: "Employee not found",
        status: 404,
      };
    }
    const checkPass = await bcrypt.compare(password, emp.password);
    return {
      isValidPassword: checkPass,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const tokenGenerate = async (id) => {
  try {
    const emp = await Employee.findById(id);
    if (!emp) {
      return {
        message: "Employee not found",
        status: 404,
      };
    }
    let payload = {
      id: id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE),
    });
    return {
      token: token,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const testLogin = async (id, password) => {
  try {
    const emp = await Employee.findById(id);
    if (!emp) {
      return { message: "Employee not found", status: 404 };
    }
    const isValidPass = bcrypt.compareSync(password, emp.password);
    if (!isValidPass) {
      return { message: "Invalid Password", status: 400 };
    }
    let payload = {
      id: id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE),
    });
    return {
      token: token,
      status: 200,
    };
  } catch (err) {}
};

const tokenVerification = async (id, token) => {
  try {
    const isValidToken = await jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return { message: err.message, status: 500 };
        }
        if (id != decoded.id) {
          return {
            message: "You are not authorized to access this API.",
            status: 403,
          };
        }
        return {
          decoded: decoded,
          status: 200,
        };
      }
    );
    return isValidToken;
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

module.exports = {
  getEmployeesData,
  getEmployeeData,
  createEmployee,
  updateEmployeeData,
  deleteEmployeeData,
  validatePassword,
  tokenGenerate,
  testLogin,
  tokenVerification,
};
