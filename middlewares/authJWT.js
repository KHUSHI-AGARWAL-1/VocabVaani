const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const util = require("util");
// const jwt = require("jsonwebtoken");
const verifyAsync = util.promisify(jwt.verify);

const verifyToken = async (req, res, next) => {
  try {
    const token = req.session.token;

    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }

    // Verify the token asynchronously using Promises
    const decoded = await verifyAsync(token, config.secret);

    req.session.user = {
      _id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      password: decoded.password,
      roles: decoded.roles
    };
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
};

module.exports = verifyToken;


const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const roles = await Role.find({ _id: { $in: user.roles } }).exec();

    const isAdmin = roles.some(role => role.name === "admin");

    if (isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Require Admin Role!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
};
module.exports = authJwt;
