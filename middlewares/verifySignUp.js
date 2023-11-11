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

// checkDuplicateUsernameOrEmail = (req, res, next) => {
//   // Username
//   User.findOne({
//     username: req.body.username
//   }).exec((err, user) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }

//     if (user) {
//       res.status(400).send({ message: "Failed! Username is already in use!" });
//       return;
//     }

//     // Email
//     User.findOne({
//       email: req.body.email
//     }).exec((err, user) => {
//       if (err) {
//         res.status(500).send({ message: err });
//         return;
//       }

//       if (user) {
//         res.status(400).send({ message: "Failed! Email is already in use!" });
//         return;
//       }

//       next();
//     });
//   });
// };

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;