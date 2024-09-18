const Employee = require("../models/employee.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient.js");
redisClient.connect();
const redisLogin = async (id, password) => {
  try {
    const emp = await Employee.findById(id);
    if (!emp) {
      return { message: "Employee not found.", status: 404 };
    }
    const isValidPass = bcrypt.compare(password, emp.password);
    if (!isValidPass) {
      return { message: "Invalid Password", status: 400 };
    }
    let payload = {
      id: id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE),
    });
    await redisClient.set(id, token, "EX", 3600);
    return { token: token, status: 200 };
  } catch (err) {
    return { message: err.message, status: 500 };
  }
};

const redisAuthentication = async (id, token) => {
  const redisToken = await redisClient.get(id, (err) => {
    if (err) {
      return { message: err.message, status: 500 };
    }
  });
  if (token !== redisToken) {
    return { message: "Invalid token", status: 500 };
  }
  const result = await jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        return { message: err.message, status: 500 };
      }
      return {decoded : decoded, status: 200 };
    }
  );
  return result;
};

const logoutRedis = async (id) => {
  try {
    const result = await redisClient.del(id);
    if (result === 1) {
      return { message: "Logout Successfully.", status: 200 };
    } else {
      return { message: "Error while logout", status: 500 };
    }
  } catch (err) {
    return { message: err, status: 500 };
  }
};
module.exports = { redisLogin, redisAuthentication, logoutRedis };
