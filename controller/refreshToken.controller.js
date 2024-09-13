const bcrypt = require("bcrypt");
const joi = require("joi");
const employee = require("../models/employee.model.js");
const redisClient = require("../redisClient.js");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utility/jwtRedisRefresh.utility.js");

const loginValidationSchema = joi.object({
  id: joi
    .string()
    .required()
    .messages({ "string.empty": "Id can't be empty." }),
  password: joi
    .string()
    .required()
    .messages({ "string.empty": "Please provide Password." }),
});

const refreshTokenValidation = joi.object({
  refreshtoken: joi
    .string()
    .required()
    .messages({ "string.empty": "Please Provide Token." }),
});

const loginEmployee = async (req, res) => {
  try {
    const { id, password } = req.body;
    const isValid = loginValidationSchema.validate({
      id: id,
      password: password,
    });
    if (isValid.error) {
      return res.status(500).json({ message: error.message });
    }
    const emp = await employee.findById(id);
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const validPass = bcrypt.compare(password, emp.password);
    if (!validPass) {
      return res.status(500).json({ message: "Invalid password" });
    }
    const accessToken = await generateAccessToken(id);
    const refreshToken = await generateRefreshToken(id);
    return res
      .status(200)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getNewAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const isValidInput = refreshTokenValidation.validate({
      refreshtoken: refreshToken,
    });
    if (isValidInput.error) {
      return res.status(500).json({ message: isValidInput.error.message });
    }
    const isValidRefreshToken = await redisClient.get(refreshToken);
    if (!isValidRefreshToken) {
      return res.json({ message: "Invalid Refresh token" });
    }
    const jsonData = await verifyToken(
      refreshToken,
      process.env.JWT_Refresh_SECRET
    );
    if (jsonData.status == 500) {
      return res.status(500).json(jsonData);
    }
    const newaccessToken = await generateAccessToken(jsonData.id);
    //Refresh Token Rotation : refresh token is issued along with the new access token.
    const newRefreshToken = await generateRefreshToken(jsonData.id);
    return res.status(200).json({
      newAccessToken: newaccessToken,
      newRefreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getNewRefreshToken = async (req, res) => {
  let refreshToken = req.body.refreshToken;
  const isValidInput = refreshTokenValidation.validate({
    refreshtoken: refreshToken,
  });
  if (isValidInput.error) {
    return res.status(500).json({ message: isValidInput.error.message });
  }
  const decode = await verifyToken(
    refreshToken,
    process.env.JWT_Refresh_SECRET
  );
  if (decode.status == 500) {
    return res.status(500).json(decode);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  let newRefreshToken = "Token is valid.No need to generate refresh token";
  let status = 0;
  if (decode.exp - currentTime < 1000) {
    console.log(decode.id);
    newRefreshToken = await generateRefreshToken(decode.id);
    status = 1;
  }
  return res
    .status(200)
    .json({ newRefreshToken: newRefreshToken, status: status });
};

const logoutAndDeleteToken = async (req, res) => {
  const refreshToken = req.body.refreshtoken;
  const isValidInput = refreshTokenValidation.validate({
    refreshtoken: refreshToken,
  });
  if (isValidInput.error) {
    return res.status(401).json({ message: isValidInput.error.message });
  }
  const isAvailableToken = await redisClient.get(refreshToken);
  if (!isAvailableToken) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  const deleteTokenData = await redisClient.del(refreshToken);
  if(deleteTokenData === 1){
    return res.status(200).json({ message: "Logout Successfully." });
  }else{
    return res.status(500).json({ message: "Error while logout" });
  }
};
module.exports = {
  loginEmployee,
  getNewAccessToken,
  getNewRefreshToken,
  logoutAndDeleteToken,
};
