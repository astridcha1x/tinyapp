// ----------- VARIABLES/FUNCS/ESSENTIALS ---------- //

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

app.use(bodyParser.urlencoded({extended: true}));

// SET COOKIES, NOW WITH COOKIE-SESSION //
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// EJS SET AS THE VIEW ENGINE // 
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// FUNCTIONS FROM HELPERS.JS IMPLEMENTATION //
const {generateRandomString, getUserByEmail, checkForPassword, checkUserLink} = require ("./helpers");


// ---------- ROUTES ---------- //

// SERVER START //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// URL PAGE INDEX WITH THE URLS INPUTTED //
app.get("/urls", (req, res) => {
  let cookie = req.session;
  let templateVars = { urls: checkUserLink(urlDatabase, cookie.user_id), user: users[cookie.user_id] };
  res.render("urls_index", templateVars);
});

// CREATE NEW URL //
app.get("/urls/new", (req, res) => {
  let cookie = req.session;
  if (cookie.user_id) {
    res.render("urls_new", { user: users[cookie.user_id] });
  }
    res.redirect("/login");
}); // keep this above the route definition below

// FORM SUBMISSION REDIRECT //
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL].longURL);
});

app.post("/urls", (req, res) => {
  let cookie = req.session;
  const generateShortURL = generateRandomString();
  urlDatabase[generateShortURL] = {
    longURL: req.body.longURL,
    userID: cookie.user_id
  };
  res.redirect(`/urls/${generateShortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  res.redirect(`/urls/${short}`);
});

// RUN /urls/new //
app.get("/urls/:shortURL", function(req, res) {
  let cookie = req.session;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.render("urls_show", { longURL: longURL, shortURL: shortURL, user: req.cookies[cookie.user_id] });
});

// DELETE URLS //
app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  let cookie = req.session;
  let linksOfUser = checkUserLink(urlDatabase, cookie.user_id);
  
  if (linksOfUser[short]) {
    delete urlDatabase[short];
    res.redirect("/urls");
  }
    res.send("Sorry, you don't have permission to delete this link!");
});

// EDIT URLS //
app.post("/urls/:shortURL/edit", (req, res) => {
  let cookie = req.session;
  let short = req.params.shortURL;
  let userObject = checkUserLink(urlDatabase, users[cookie.user_id]);
  if (userObject[short]) {
    urlDatabase[short] = req.body.longURL;
    res.redirect("/urls");
  }
    res.status.send("ERROR 403: You don't have permission to edit this link!");
});

// LOGIN //
app.get("/login", (req, res) => {
  let cookie = req.session;
  res.render("login", { user: users[cookie.user_id]});
});

app.post("/login", function(req, res) {
  let emailForLogin = req.body.email;
  let passForLogin = req.body.password;
  let user = getUserByEmail(emailForLogin, users);
  let passwordCheck = checkForPassword(emailForLogin, passForLogin, users);

  if (user && passwordCheck) {
    req.session.user_id = user;
    req.session.save();
  }
    res.status(403).send(`ERROR 403: The email / password you have entered is invalid!`);
    res.redirect("/urls");
});

// LOGOUT //
app.post("/logout", function(req, res) {
  req.session = null;
  res.redirect("/urls");
});

// REGISTRATION //
app.get("/register", (req, res) => {
  let cookie = req.session;
  res.render("register", { user: users[cookie.user_id] });
});

app.post("/register", function(req, res) {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send(`ERROR 400: please enter an email and/or password!`);
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send("ERROR 400: the email you have entered is already in use!");
  }
    let userID = generateRandomString();
    res.cookie(`email`, req.body.email);
    res.cookie(`password`, req.body.password);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
   res.redirect("/urls");
});