const { authJwt } = require("../middlewares");
const express =  require('express');
const controller = require("../controllers/userController");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const router = express.Router();


router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

  router.get("/api/test/all", controller.allAccess);

  router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  router.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  router.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  router.post('/delete-account', async (req, res) => {
    const confirmation = req.body.confirmation;
  
    if (confirmation === 'yes') {
      try {
        // Assuming you have a user ID stored in the session or request
        const userId = req.session.user._id; // Adjust this based on your authentication setup
  
        console.log('User ID from session:', userId);
        if (!userId) {
          return res.status(400).send('User ID is not available');
        }
        // Find the user by ID
        const user = await User.findById(userId);
        
  
        console.log('User:', user);
        if (!user) {
          return res.status(404).send('User not found');
        }
  
        // Delete the user and their associated role
        await User.deleteOne({ _id: userId });
  
        // You might need to delete the associated role from your database here
        // For example, if the role is stored in another collection
        await Role.findByIdAndDelete(user.roles);
  // Clear the session
  req.session.destroy();

  // Optionally, clear the token cookie
  res.clearCookie('token');

        // Redirect or render a success page
        res.render('delete');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      // If the user clicks "Cancel," redirect them to the main page
      res.redirect('/main');
    }
  });
  
  module.exports = router;
  






















