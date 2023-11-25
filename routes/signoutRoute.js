const express = require('express');
const router = express.Router();

router.get('/test-signout', (req, res) => {
  try {
    console.log('Before destroying session:', req.session);
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error destroying session" });
      } else {
        console.log('After destroying session:', req.session);
        res.clearCookie('token');
        res.redirect('/'); // Redirect to the login page or any public page
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
