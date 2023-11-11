const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dbConfig=require('./config/db.config')
const app = express();
 const path=require('path')
let corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname,'views'));
// now for public folder
app.use(express.static(path.join(__dirname,'public')));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Use cookie-parser middleware
app.use(cookieParser());

// Use express-session middleware
app.use(session({
  secret: 'VocabVaani-secret-key', // Replace with a secret key for session encryption
  resave: false,
  saveUninitialized: true,
}));
const db = require("./models");
const Role = db.role;

// const dbConfig = {
//   HOST: "0.0.0.0",
//   PORT: 27017,
//   DB: "VocabVaani"
// };

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
  // res.json({ message: "Welcome to VocabVaani application." });
});


require('../VocabVaani/routes/authRoute')(app);
require('../VocabVaani/routes/userRoute')(app);
  
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