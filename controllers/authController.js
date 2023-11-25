const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const session = require('express-session');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const { userBoard } = require("./userController");


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
      roles: req.body.role,
      searchHistory: [],
    });

    await user.save();
    if(user.roles=='user')
    res.redirect(`/main?id=${user._id}&username=${user.username}&email=${user.email}&roles=${user.roles}`);
    else if(user.roles=='moderator'){
      res.redirect(`/mainM?id=${user._id}&username=${user.username}&email=${user.email}&roles=${user.roles}`); 
    }
  else{
    res.redirect(`/mainA?id=${user._id}&username=${user.username}&email=${user.email}&roles=${user.roles}`);
  }
    // return;
    // res.status(200).json({ message: "User was registered successfully!" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.signin = async (req, res) => {
  try {
    console.log("Request Body:", req.body.username);

    const user = await User.findOne({
      username: req.body.username,
    })

    console.log("User object:", user);

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid Password!" });
    }
    const token = jwt.sign({ id: user._id }, config.secret, {
      algorithm: 'HS256', 
      allowInsecureKeySizes: true,
      expiresIn: 86400, // 24 hours
    });

    const authorities = user.roles.toUpperCase();
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 });
    // Store user information in the session
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
    };
    req.session.token = token;
if(user.roles=='user')
    res.redirect(`/main?id=${user._id}&username=${user.username}&email=${user.email}&roles=${user.roles}`);
else if(user.roles=='moderator'){
  res.redirect(`/mainM?id=${user._id}&username=${user.username}&email=${user.email}&roles=${user.roles}`); 
}
  else{
    res.redirect(`/mainA?id=${user._id}&username=${user.username}&email=${user.email}&roles=${user.roles}`);
  }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// exports.signout = async (req, res) => {
//   try {
//     console.log('Before destroying session:', req.session);
//     req.session.destroy((err) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error destroying session" });
//       } else {
//         console.log('After destroying session:', req.session);
//         res.clearCookie('token');
//         res.redirect('/'); // Redirect to the login page or any public page
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.signout = (req, res) => {
  try {
    console.log('Before destroying session:', req.session);
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error destroying session" });
      } else {
        console.log('After destroying session:', req.session);
        res.clearCookie('token');
        // Use res.redirect inside the callback
        res.redirect('/'); // Redirect to the login page or any public page
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
