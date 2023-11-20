const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dbConfig=require('./config/db.config')
const User = require("./models/userModel");
const userRole = require("./models/roleModel");
const app = express();
const path=require('path')
const db = require("./models");
const authroute = require("./routes/authRoute");
const userroute = require("./routes/userRoute");
const Role = db.role;
const flash = require("connect-flash");
const mongoose=require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const bcrypt= require('bcrypt')
let corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'VocabVaani-secret-key', // Replace with a secret key for session encryption
  resave: false,
  saveUninitialized: true,
}));
app.use(authroute)
app.use(userroute)
app.use(flash());

// Middleware to make flash messages available to all views
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  next();
});

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.render('home')
});
app.get("/signup", (req, res) => {
  res.render('signupForm')
});
app.get("/signin", (req, res) => {
  res.render('signinForm')
});
app.get('/main', (req, res) => {
  const username = req.query.username;
  const userId = req.session.userId;
  res.render('main', { username,userId });
});

app.get("/delete/", (req, res) => {
  res.render('confirmDelete')
});
app.get('/viewprofile',(req,res)=>{
  const username = req.query.username;
  const email = req.query.email;
  const role = req.query.roles;
  res.render('viewProfile', { username,email,role });
})
app.get('/faqs',(req,res)=>{
  res.render('FAQs')
})
app.post('/search', async (req, res) => {
  const word = req.body.word;
  console.log('Req Query:', req.query);
  console.log('Word:', word); 
  const user = req.session.user;

  // Assuming you have a username property in your user object
  const username = user ? user.username : null;

  const searchHistory = req.session.searchHistory || [];
  
  // Add the current search word to the history
  searchHistory.push(word);

  // Keep only the last 5 searches
  if (searchHistory.length > 5) {
    searchHistory.shift(); // Remove the oldest entry
  }

  // Update the session with the new search history
  req.session.searchHistory = searchHistory;

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
    //console.log(definition.split(";"));
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
    // Similarly, make requests to other APIs (thesaurus, rhyme, profanity) here
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

    res.render('main2', { word, dictionaryResult,truedefinition,thesaurusResult,rhymeResult,searchHistory,username: username});
  } catch (error) {
    console.error('Error:', error);
    res.render('main', { error: 'An error occurred' });
  }
});

app.get('/user/history', (req, res) => {
  // Retrieve the search history from the session
  const searchHistory = req.session.searchHistory || [];

  res.render('searchHistory', { searchHistory });
});

app.get('/settings',(req,res)=>{
  res.render('settings')
})



// Route to handle changing username
app.post("/settings/change-username", async (req, res) => {
  const { newUsername } = req.body;

  try {
    // Get the user ID from the session
const userId = req.session.user ? req.session.user._id :null;

// Check if userId is a valid ObjectId
if (!ObjectId.isValid(userId)) {
  console.error('Invalid user ID:', userId);
  req.flash('errorMessage', 'Invalid user ID');
  return res.redirect('/settings');
}
    console.log('User ID:', userId);
    console.log('Session User:', req.session.user);
    // Update the username in the database (replace 'userId' with the actual user ID)
    const result = await User.updateOne({ _id: new ObjectId(userId)}, { username: newUsername });
    console.log('Filter:', { _id: new ObjectId(userId) });
    console.log('Update:', { username: newUsername });
    console.log('Update Result:', result);
    // Flash success message
    req.flash("successMessage", "Username changed successfully");

    // Redirect back to the settings page
    res.redirect("/settings");
  }  catch (error) {
    console.error('Error changing username:', error);
    req.flash('errorMessage', 'An error occurred while changing the username');
    res.redirect('/settings');
  }
});
// Route to handle changing email
app.post("/settings/change-email", async (req, res) => {
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
    await User.updateOne({_id: new ObjectId(userId) }, { email: newEmail });

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
app.post("/settings/change-password", async (req, res) => {
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
    await User.updateOne({ _id: new ObjectId(userId)}, { password: hashedPassword });

   // Flash success message
   req.flash("successMessage", "Password changed successfully");

   // Redirect back to the settings page
   res.redirect("/settings");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal Server Error");
  }
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

  async function initial() {
    try {
      const count = await Role.estimatedDocumentCount();
  
      if (count === 0) {
        await Role.create([
          { name: "user" },
          { name: "moderator" },
          { name: "admin" }
        ]);
  
        console.log("Roles added to the collection");
      }
    } catch (err) {
      console.error("Error when estimating document count or adding roles", err);
    }
 }
 