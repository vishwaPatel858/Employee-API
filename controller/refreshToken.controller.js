const joi = require("joi");
const {
  loginEmp,
  getAccessToken,
  logout,
} = require("../service/refreshToken.service.js");

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
    let response = await loginEmp(id, password);
    res.status(response.status).json(response);
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
    const response = await getAccessToken(refreshToken);
    res.status(response.status).json(response);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
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
    newRefreshToken = await generateRefreshToken({id:decode.id});
    status = 1;
  }
  return res
    .status(200)
    .json({ newRefreshToken: newRefreshToken, status: status });
};*/

const logoutAndDeleteToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshtoken;
    const isValidInput = refreshTokenValidation.validate({
      refreshtoken: refreshToken,
    });
    if (isValidInput.error) {
      return res.status(401).json({ message: isValidInput.error.message });
    }
    const response = await logout(refreshToken);
    res.status(response.status).json(response);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  loginEmployee,
  getNewAccessToken,
  logoutAndDeleteToken,
};
