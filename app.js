const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dbConfig=require('./config/db.config')
const app = express();
const path=require('path')
const db = require("./models");
const authroute = require("./routes/authRoute");
const Role = db.role;
// const axios = require('axios')
// require('../VocabVaani/routes/authRoute')(app);
// require('../VocabVaani/routes/userRoute')(app);
  
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
  res.render('main', { username });
});
app.get("/delete", (req, res) => {
  res.render('confirmDelete')
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
 
