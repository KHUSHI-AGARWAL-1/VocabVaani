const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/authController");
const express = require('express');
const router = express.Router();


// router.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
//   next();
// });


router.post(
  "/api/auth/signup",
  
    verifySignUp.checkDuplicateUsernameOrEmail,
  
  controller.signup
);

router.get("/api/auth/signin", (req, res) => {
  // Render a signin form
  res.render('main');
});
// router.get("/api/auth/signout", (req, res) => {
//   res.redirect('/');
// });


router.post("/api/auth/signin", controller.signin);
router.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
router.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  next();
});
// router.post("/api/auth/signout", controller.signout);

module.exports = router;