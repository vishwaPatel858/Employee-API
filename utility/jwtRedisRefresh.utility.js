const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient.js");
const generateAccessToken = async (payload) => {
  try {
    const accessToken = await jwt.sign(payload, process.env.JWT_Access_SECRET, {
      expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE),
    });
    return accessToken;
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const generateRefreshToken = async (payload) => {
  try {
    const refreshToken = await jwt.sign(
      payload,
      process.env.JWT_Refresh_SECRET,
      {
        expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE_REFRESH),
      }
    );
    redisClient.set(payload.id, refreshToken);
    redisClient.set(refreshToken, payload.id);
    return refreshToken;
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

const verifyToken = async (token, secretKey) => {
  try {
    const decode = await jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return {
          message: err.message,
          status: 500,
        };
      } else {
        return decoded;
      }
    });
    return decode;
  } catch (err) {
    return {
      message: err.message,
      status: 500,
    };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
