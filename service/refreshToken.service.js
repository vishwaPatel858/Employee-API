const Employee = require("../models/employee.model.js");
const bcrypt = require("bcrypt");
const redisClient = require("../redisClient.js");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utility/jwtRedisRefresh.utility.js");

const loginEmp = async (id, password) => {
  try {
    const emp = await Employee.findById(id);
    if (!emp) {
      return { message: "Employee not found", status: 404 };
    }
    const validPass = bcrypt.compare(password, emp.password);
    if (!validPass) {
      return { message: "Invalid password", status: 500 };
    }
    const accessToken = await generateAccessToken({ id: id });
    const refreshToken = await generateRefreshToken({ id: id });
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const getAccessToken = async (refreshToken) => {
  try {
    const isValidRefreshToken = await redisClient.get(refreshToken);
    if (!isValidRefreshToken) {
      return { message: "Invalid Refresh token", status: 401 };
    }
    const jsonData = await verifyToken(
      refreshToken,
      process.env.JWT_Refresh_SECRET
    );
    if (jsonData.status == 500) {
      return jsonData;
    }
    const newaccessToken = await generateAccessToken({ id: jsonData.id });
    //Refresh Token Rotation : refresh token is issued along with the new access token.
    const newRefreshToken = await generateRefreshToken({ id: jsonData.id });
    await redisClient.del(refreshToken);
    return {
      newAccessToken: newaccessToken,
      newRefreshToken: newRefreshToken,
      status: 200,
    };
  } catch (err) {
    return { message: err.message, status: 500 };
  }
};

const logout = async (refreshToken) => {
  try {
    const isAvailableToken = await redisClient.get(refreshToken);
    if (!isAvailableToken) {
      return { message: "Invalid Token", status: 400 };
    }
    const deleteTokenData = await redisClient.del(refreshToken);
    if (deleteTokenData === 1) {
      return { message: "Logout Successfully.", status: 200 };
    } else {
      return { message: "Error while logout", status: 500 };
    }
  } catch (err) {
    return { message: err.message, status: 500 };
  }
};

module.exports = { loginEmp, getAccessToken, logout };
