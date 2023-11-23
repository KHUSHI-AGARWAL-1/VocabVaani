const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check if req.body.username and req.body.email are defined
    if (!req.body.username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check for duplicate username
    const existingUserByUsername = await User.findOne({ username: req.body.username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Failed! Username is already in use!" });
    }

    // Check for duplicate email
    const existingUserByEmail = await User.findOne({ email: req.body.email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Failed! Email is already in use!" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


const verifySignUp = {
  checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;