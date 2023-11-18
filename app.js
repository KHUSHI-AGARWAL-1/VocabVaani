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
 

 
 
 
 
//  //kar diya kaam panda💪💪💪💪
//  let word = 'happy'; app.get('/search',(req,res)=>{

//  })
// let apiKey = 'Lt6dQ53TeMN9iCe3R2166A==OvKwqJTX0kcjbVaL';
//  let dictionaryUrl = 'https://api.api-ninjas.com/v1/dictionary?word=' + word;
//  let thesaurusUrl = 'https://api.api-ninjas.com/v1/thesaurus?word=' + word;
//  let rhymeUrl = 'https://api.api-ninjas.com/v1/rhyme?word=' + word;
//  fetch(dictionaryUrl, {
//      method: 'GET',
//      headers: {
//          'X-Api-Key': apiKey,
//          'Content-Type': 'application/json',
//      },
//  })
//      .then(response => {
 
//          if (!response.ok) {
//              throw new Error('Network response was not ok: ' + response.statusText);
//          }
 
//          return response.json();
//      })
//      .then(result => {
 
//          console.log(result);
//      })
//      .catch(error => {
 
//          console.error('Error:', error);
//      });
//  fetch(thesaurusUrl, {
//      method: 'GET',
//      headers: {
//          'X-Api-Key': apiKey,
//          'Content-Type': 'application/json',
//      },
//  })
//      .then(response => {
 
//          if (!response.ok) {
//              throw new Error('Network response was not ok: ' + response.statusText);
//          }
 
//          return response.json();
//      })
//      .then(result => {
 
//          console.log(result);
//      })
//      .catch(error => {
 
//          console.error('Error:', error);
//      });
//  fetch(rhymeUrl, {
//      method: 'GET',
//      headers: {
//          'X-Api-Key': apiKey,
//          'Content-Type': 'application/json',
//      },
//  })
//      .then(response => {
 
//          if (!response.ok) {
//              throw new Error('Network response was not ok: ' + response.statusText);
//          }
 
//          return response.json();
//      })
//      .then(result => {
 
//          console.log("Rhyme:"+result);
//      })
//      .catch(error => {
 
//          console.error('Error:', error);
//      });



app.post('/search', async (req, res) => {
  const word = req.body.word;
  // const username = req.query.username;
  // const userId = req.session.userId;
  console.log('Word:', word); 
  const apiKey = 'Lt6dQ53TeMN9iCe3R2166A==OvKwqJTX0kcjbVaL';
  const dictionaryUrl = 'https://api.api-ninjas.com/v1/dictionary?word=' + word;
  const thesaurusUrl = 'https://api.api-ninjas.com/v1/thesaurus?word=' + word;
  const rhymeUrl = 'https://api.api-ninjas.com/v1/rhyme?word=' + word;
  const profanityUrl = 'https://api.api-ninjas.com/v1/profanityfilter?text=' + word;

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

    // Similarly, make requests to other APIs (thesaurus, rhyme, profanity) here

    res.render('main', { word, dictionaryResult});
  } catch (error) {
    console.error('Error:', error);
    res.render('main', { error: 'An error occurred' });
  }
});