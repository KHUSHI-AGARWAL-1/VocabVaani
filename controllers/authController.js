const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");


exports.signup = async (req, res) => {
  try {
    const password = req.body.password;

    if (password.length !== 8) {
      return res.status(400).json({ error: "Password must be exactly 8 characters long." });
    }
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    await user.save();
    let roles;
    if (req.body.roles) {
      roles = await Role.find({
        name: { $in: req.body.roles },
      });
    } 
    else {
      // Default role if not specified
      const defaultRole = await Role.findOne({ name: "user" });
      roles = [defaultRole];
    }

    // Assign roles to the user
    user.roles = roles.map((role) => role._id);

    // Save the user with roles assigned
    await user.save();
res.redirect('/main')
// return;
    // res.status(200).json({ message: "User was registered successfully!" });
  } catch (error) {
console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.signin = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    
    const user = await User.findOne({
      username: req.body.username,
    }).populate("roles", "-__v");

    console.log("User object:", user);

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid Password!" });
    }
    const token = jwt.sign({ id: user.id }, config.secret, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
          });
      
          const authorities = user.roles.map((role) => "ROLE_" + role.name.toUpperCase());
          res.cookie('token', token, { httpOnly: true });
           // Store user information in the session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
    };
          req.session.token = token;
      
         // In the signup route handler
         res.redirect(`/main?id=${user._id}&username=${user.username}&email=${user.email}&roles=${authorities.join(',')}`);
         return;
  }
   catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.signout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error destroying session" });
      }
      
      // Optionally, you can clear the token cookie
      res.clearCookie('token');

      return res.status(200).send({ message: "You've been signed out!" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};