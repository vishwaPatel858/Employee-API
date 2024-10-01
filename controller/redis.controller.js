const joi = require("joi");
const {
  redisLogin,
  redisAuthentication,
  logoutRedis,
  sendOTP,
  otpVerification,
  resetPassword,
} = require("../service/redistoken.service.js");
const {
  generateAccessToken,
} = require("../utility/jwtRedisRefresh.utility.js");

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
    const validate = loginValidationSchema.validate({
      id: id,
      password: password,
    });
    if (validate.error) {
      return res.status(500).json({ message: error.message });
    }
    const response = await redisLogin(id, password);
    res.status(response.status).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const authenticate = async (req, res, next) => {
  try {
    const id = req.body.id;
    const token = req.headers["access-token"];
    const response = await redisAuthentication(id, token);
    if (response.status !== 200) {
      return res.status(response.status).json(response);
    }
    next();
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
  const token = await generateAccessToken(payload);
  res.status(200).json({ token });
};

const logout = async (req, res) => {
  const id = req.params.id;
  if (id === null || id === undefined) {
    return res.status(404).json({ message: "Id required" });
  }
  const response = await logoutRedis(id);
  res.status(response.status).json(response);
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    sendOTP(email)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    otpVerification(email, otp)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPass = (req, res) => {
  try {
    const { password, token } = req.body;
    resetPassword(token, password)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  login,
  authenticate,
  generateTokenWithPayload,
  logout,
  forgetPassword,
  verifyOTP,
  resetPass
};
