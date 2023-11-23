const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dbConfig = require('./config/db.config')
const User = require("./models/userModel");
const path = require('path')
const db = require("./models");
const authroute = require("./routes/authRoute");
const userroute = require("./routes/userRoute");
const mongoose = require('mongoose')

//middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'VocabVaani-secret-key', 
  resave: false,
  saveUninitialized: true,
}));

app.use(authroute)
app.use(userroute)

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


