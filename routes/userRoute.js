const { authJwt } = require("../middlewares");
const express = require('express');
const controller = require("../controllers/userController");
const session = require("express-session");
const User = require("../models/userModel");
const flash = require("connect-flash");
const router = express.Router();
const { ObjectId } = require('mongodb');
router.use(session({
  secret: 'VocabVaani-secret-key', 
  resave: false,
  saveUninitialized: true,
}));
router.use(flash());

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});
// Middleware to make flash messages available to all views
router.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
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

// simple route
router.get("/", (req, res) => {
  res.render('home')
});
router.get("/signup", (req, res) => {
  res.render('signupForm')
});
router.get("/signin", (req, res) => {
  res.render('signinForm')
});
router.get('/main', (req, res) => {
  const username = req.query.username;
  const userId = req.query.userId;
  res.render('main', { username, userId });
});
router.get('/mainA', (req, res) => {
  const username = req.query.username;
  const userId = req.query.userId;
  res.render('mainA', { username, userId });
});
router.get('/mainM', (req, res) => {
  const username = req.query.username;
  const userId = req.query.userId;
  res.render('mainM', { username, userId });
});
router.get("/delete/", (req, res) => {
  res.render('confirmDelete')
});
router.post('/delete-account', async (req, res) => {
  const confirmation = req.body.confirmation;
  if (confirmation === 'yes') {
    try {
      console.log('Session:', req.session); // Log the entire session

      const userId = req.session.user._id;
      // const userId = req.body.userId;
      console.log('User ID from session:', userId);
      if (!userId) {
        return res.status(400).send('User ID is not available');
      }
      const user = await User.findById(userId);
      console.log('User:', user);
      if (!user) {
        return res.status(404).send('User not found');
      }
      await User.deleteOne({ _id: userId });
      req.session.destroy();
      res.clearCookie('token');
      res.render('delete');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/main');
  }
});

router.get('/viewprofile', (req, res) => {
  const user = req.session.user;
  res.render('viewProfile', { user });
});

router.get('/faqs', (req, res) => {
  res.render('FAQs')
})
router.post('/search', async (req, res) => {
  const word = req.body.word;
  console.log('Req Query:', req.query);
  console.log('Word:', word);
  const user = req.session.user;
  
  const username = user ? user.username : null;
  // Retrieve user's search history from the database
  const userWithHistory = await User.findOne({ username: user.username });
  const searchHistory = userWithHistory ? userWithHistory.searchHistory : [];

  // Add the current search word to the history
  searchHistory.push(word);

  // Keep only the last 5 searches
  if (searchHistory.length > 5) {
    searchHistory.shift(); // Remove the oldest entry
  }
  await User.updateOne({ username: user.username }, { $set: { searchHistory } })

  const apiKey = 'Lt6dQ53TeMN9iCe3R2166A==OvKwqJTX0kcjbVaL';
  const dictionaryUrl = 'https://api.api-ninjas.com/v1/dictionary?word=' + word;
  const thesaurusUrl = 'https://api.api-ninjas.com/v1/thesaurus?word=' + word;
  const rhymeUrl = 'https://api.api-ninjas.com/v1/rhyme?word=' + word;
  try {
    const dictionaryResponse = await fetch(dictionaryUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!dictionaryResponse.ok) {
      throw new Error('Network response was not ok: ' + dictionaryResponse.statusText);
    }

    const dictionaryResult = await dictionaryResponse.json();
    const { definition } = dictionaryResult;
    let truedefinition = definition.split(";");
    truedefinition.shift()

    if (truedefinition.length > 2) {
      truedefinition = truedefinition.slice(0, 2);
    }
    console.log(truedefinition);
    const thesaurusResponse = await fetch(thesaurusUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!thesaurusResponse.ok) {
      throw new Error('Network response was not ok: ' + thesaurusResponse.statusText);
    }
    const thesaurusResult = await thesaurusResponse.json();
    const rhymeResponse = await fetch(rhymeUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!rhymeResponse.ok) {
      throw new Error('Network response was not ok: ' + rhymeResponse.statusText);
    }

    const rhymeResult = await rhymeResponse.json();


    
    res.render('main2', { word, dictionaryResult, truedefinition, thesaurusResult, rhymeResult, searchHistory, username: username });
  } catch (error) {
    console.error('Error:', error);
    res.render('main', { error: 'An error occurred' });
  }
});
router.get('/user/history', async (req, res) => {
  try {
    // Retrieve the user's search history from the database
    const user = req.session.user;
    const userWithHistory = await User.findOne({ username: user.username });
    const searchHistory = userWithHistory ? userWithHistory.searchHistory : [];

    // Render the searchHistory.ejs template with the searchHistory data
    res.render('searchHistory', { searchHistory });
  } catch (error) {
    console.error('Error:', error);
    res.render('searchHistory', { error: 'An error occurred' });
  }
});

router.get('/settings', (req, res) => {
  res.render('settings')
})



// Route to handle changing username
router.post("/settings/change-username", async (req, res) => {
  const { newUsername } = req.body;
  console.log(req)
  try {
    // Get the user ID from the session
    const userId = req.session.user ? req.session.user._id : null;

    // Check if userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      console.error('Invalid user ID:', userId);
      req.flash('errorMessage', 'Invalid user ID');
      return res.redirect('/settings');
    }
    console.log('User ID:', userId);
    console.log('Session User:', req.session.user);
    // Update the username in the database (replace 'userId' with the actual user ID)
    const result = await User.updateOne({ _id: new ObjectId(userId) }, { username: newUsername });
    console.log('Filter:', { _id: new ObjectId(userId) });
    console.log('Update:', { username: newUsername });
    console.log('Update Result:', result);
    // Update the username in the session
    req.session.user.username = newUsername;
    // Flash success message
    req.flash("successMessage", "Username changed successfully");

    // Redirect back to the settings page
    res.redirect("/settings");
  } catch (error) {
    console.error('Error changing username:', error);
    req.flash('errorMessage', 'An error occurred while changing the username');
    // res.redirect('/settings');
    // Redirect back to the settings page
    res.redirect(`/viewprofile?username=${newUsername}`);

  }
});
// Route to handle changing email
router.post("/settings/change-email", async (req, res) => {
  const { newEmail } = req.body;

  try {
    // Update the email in the database (replace 'userId' with the actual user ID)
    // Get the user ID from the session
    const userId = req.session.user ? req.session.user._id : null;

    // Check if userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      console.error('Invalid user ID:', userId);
      req.flash('errorMessage', 'Invalid user ID');
      return res.redirect('/settings');
    }
    await User.updateOne({ _id: new ObjectId(userId) }, { email: newEmail });

    // Flash success message
    req.flash("successMessage", "Email changed successfully");

    // Redirect back to the settings page
    res.redirect("/settings");
  } catch (error) {
    console.error("Error changing email:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle changing password
router.post("/settings/change-password", async (req, res) => {
  const { newPassword } = req.body;

  try {
    // Get the user ID from the session
    const userId = req.session.user ? req.session.user._id : null;

    // Check if userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      console.error('Invalid user ID:', userId);
      req.flash('errorMessage', 'Invalid user ID');
      return res.redirect('/settings');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the password in the database (replace 'userId' with the actual user ID)
    await User.updateOne({ _id: new ObjectId(userId) }, { password: hashedPassword });

    // Flash success message
    req.flash("successMessage", "Password changed successfully");

    // Redirect back to the settings page
    res.redirect("/settings");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Admin routes
router.get('/admin/viewusers', async (req, res) => {
  try {
    const userList = await User.find(); // Execute the query to get the list of users
    console.log(userList);
    res.render('viewUsers', { list: userList }); // Pass the users data to the view
  } catch (error) {
    // Handle error appropriately
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/admin/deleteUser/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Delete the user by ID
    await User.findByIdAndDelete(userId);
    res.redirect('/admin/viewusers'); // Redirect back to the user list after deletion
  } catch (error) {
    // Handle error appropriately
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//moderator routes 
router.get('/mod/viewusers', async (req, res) => {
  try {
    const userList = await User.find(); // Execute the query to get the list of users
    console.log(userList);
    res.render('viewUsersM', { list: userList }); // Pass the users data to the view
  } catch (error) {
    // Handle error appropriately
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});  
router.get('/abt', (req, res) => {
  res.render('abt');
});
module.exports = router;























