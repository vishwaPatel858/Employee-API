const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient.js");

const generateAccessToken = async (id) => {
  const payload = {
    id: id,
  };
  const accessToken = await jwt.sign(payload, process.env.JWT_Access_SECRET, {
    expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE),
  });
  return accessToken;
};

const generateRefreshToken = async (id) => {
  const payload = {
    id: id,
  };
  const refreshToken = await jwt.sign(payload, process.env.JWT_Refresh_SECRET, {
    expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE_REFRESH)
  });
  redisClient.set(id, refreshToken);
  redisClient.set(refreshToken, id);
  return refreshToken;
};

const verifyToken = async (token, secretKey) => {
  let decodedData = {};
  const decode = await jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      decodedData = {
        message: err.message,
        status: 500,
      };
    } else {
      decodedData = decoded;
    }
  });
  return decodedData;
};

const deleteToken = async (token)=>{
  let responseData= {};
  const isValidToken = redisClient.get(token);
  if(!isValidToken){
    return {message : 'Invalid token',status : 401}
  }
  const decode = await redisClient.del(token, (err, response) => {
    if (err) {
      responseData = {message: err.message,status: 500}
    }else{
      console.log(responseData);
      responseData = {
        status : 200
      }
    }
  });
  return responseData;
}
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  deleteToken
};
