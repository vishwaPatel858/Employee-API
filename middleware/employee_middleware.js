const { passwordSchema } = require("../validations/employee.validations.js");
const verifyResetPasswords = async (req, res, next) => {
  try {
    const { password, reentered_password } = req.body;
    const isValidPass = await passwordSchema.validate({ password: password });
    if (isValidPass.error) {
      res.status(403).json({ message: isValidPass.error.message });
    } else if (password != reentered_password) {
      res.status(403).json({ message: "Password not matched!" });
    } else {
      next();
    }
  } catch (err) {
    throw err;
  }
};
module.exports = {
  verifyResetPasswords,
};
