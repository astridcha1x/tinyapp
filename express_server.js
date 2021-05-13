// ----------- VARIABLES/FUNCS/ESSENTIALS ---------- //

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// EJS SET AS THE VIEW ENGINE
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// GENERATE A RANDOM SHORTURL //
const generateRandomString = function() {

  const randomChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let result = "";

  for (let i = 0; i < 6; i++){
    result += randomChars[Math.floor(Math.random() * randomChars.length)];
  }

  return result;

};

// CHECK FOR EMAIL IN DATABASE //
const getUserByEmail = function(email, database) {

  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }

};

// CHECK FOR PASSWORD IN DATABASE //

const checkForPassword = function(email, password, users) {

  for (let user in users) {
    if (users[user].email === email) {
      return bcrypt.compareSync(password, users[user].password);
    }
  }

  return false;

};


// ---------- ROUTES ---------- //

// SERVER START //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// JSON OBJECT WITH urlDatabase //
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// URL PAGE INDEX WITH THE URLS INPUTTED // 
app.get("/urls", (req, res) => {
  let cookie = req.cookies;
  const templateVars = { urls: urlDatabase, user: req.cookies[cookie.user_id] };
  res.render("urls_index", templateVars);
});

// CREATE NEW URL //
app.get("/urls/new", (req, res) => {
  let cookie = req.cookies;
  res.render("urls_new", { user: users[cookie.user_id] });
}); // keep this above the route definition below

// redirect after form submission
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
});

app.post("/urls", (req, res) => {
  const generateShortURL = generateRandomString();
  urlDatabase[generateShortURL] = req.body.longURL;
  res.redirect(`/urls/${generateShortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  res.redirect(`/urls/${short}`);
});

// RUN /urls/new //
app.get("/urls/:shortURL", function(req, res) {
  let cookie = req.cookies;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];

  res.render("urls_show", { longURL: longURL, shortURL: shortURL, user: req.cookies[cookie.user_id] });
});

// DELETE URLS //
app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect("/urls");
});

// EDIT URLS // 
app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL;
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
});

// LOGIN //
app.get("/login", (req, res) => {
  let cookie = req.cookies;
  res.render("login", { user: users[cookie.user_id]});
})

app.post("/login", function(req, res) {
  res.cookie("user", req.body.user);
  res.redirect("/urls");
  console.log(req.cookies[user_id]);
});

// LOGOUT //
app.post("/logout", function(req, res) {
  res.clearCookie("user", req.body.user);
  res.redirect("/urls");
});

// REGISTER //
app.get("/register", (req, res) => {
  let cookie = req.cookies;
  res.render("register", { user: users[cookie.user_id] });
});

app.post("/register", function(req, res) {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send(`ERROR 400: please enter an email and/or password!`);
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send("ERROR 400: the email you have entered is already in use!")
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
  }
  res.redirect("/urls");
});