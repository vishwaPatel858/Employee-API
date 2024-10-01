const Employee = require("../models/employee.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient.js");
const { generateOtp, sendMail } = require("../utility/send_mail.js");
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
      return { decoded: decoded, status: 200 };
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

const sendOTP = async (userEmail) => {
  try {
    const otp = generateOtp();
    await redisClient.set(userEmail, otp);
    const option = {
      to: userEmail,
      subject: "OTP for forgget password",
      message: `your otp is <strong>${otp}</strong>`,
    };
    let response;
    await sendMail(option)
      .then((res) => {
        console.log(res);
        response = {
          message: "OTP sent successfully",
          status: 200,
        };
      })
      .catch((err) => {
        throw err;
      });
    return response;
  } catch (err) {
    throw err;
  }
};
const otpVerification = async (email, otp) => {
  try {
    const actualOTP = await redisClient.get(email);
    console.log(actualOTP);
    await redisClient.del(email);
    if (actualOTP == otp) {
      const employee = await Employee.findOne({ email: email });
      console.log(employee);
      if (!employee) {
        return {
          message: "Employee not found",
          status: 404,
        };
      }
      const payload = {
        id: employee.id,
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRE),
      });
      await redisClient.set(token, employee.id);
      return {
        message: "otp verified successfully",
        status: 200,
        token: token,
      };
    } else {
      return { message: "Invalid OTP", status: 401 };
    }
  } catch (err) {
    throw err;
  }
};

const resetPassword = async (token, password) => {
  try {
    const id = await redisClient.get(token);
    const employee = await Employee.findById(id);
    if (!employee) {
      return {
        message: "Employee not found",
        status: 404,
      };
    }
    const salt = await bcrypt.genSalt(10);
    let encryptedPass = await bcrypt.hash(password, salt);
    employee.password = encryptedPass;
    const updatedEmployee = await Employee.findByIdAndUpdate(id, employee);
    return {
      message: "Employee updated successfully",
    };
  } catch (err) {
    throw err;
  }
};
module.exports = {
  redisLogin,
  redisAuthentication,
  logoutRedis,
  sendOTP,
  otpVerification,
  resetPassword
};
