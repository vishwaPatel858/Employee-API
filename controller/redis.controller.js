const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const employee = require("../models/employee.model.js");
const redis = require("redis");
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

const login = async (req, res) => {
  try {
    const { id, password } = req.body;
    if (id == null || id == undefined) {
      return res.status(500).json({ message: "Id required" });
    }
    if (password == null || password == undefined) {
      return res.status(500).json({ message: "password required" });
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
      expiresIn: 3600,
    });
    //await redisClient.del(id);
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
    const redisToken = await redisClient.get(id);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (token !== redisToken) {
        return res.status(500).json({ message: "Invalid Token" });
      }
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const generateTokenWithPayload = async (req, res) => {
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

module.exports = {
  login,
  authenticate,
  generateTokenWithPayload
};
