const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/authController");
const express = require('express');
const router = express.Router();


router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});
router.get("/api/auth/signin", (req, res) => {
  // Render a signin form
  res.render('main');
});
router.get("/api/auth/signout", (req, res) => {
  res.redirect('/');
});

router.post(
  "/api/auth/signup",
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ],
  controller.signup
);

router.post("/api/auth/signin", controller.signin);

router.post("/api/auth/signout", controller.signout);

module.exports = router;