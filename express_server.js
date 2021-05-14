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

const urlDatabase = {};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// FUNCTIONS FROM HELPERS.JS IMPLEMENTATION //
const {generateRandomString, getUserByEmail } = require ("./helpers");

const checkUserLink = function(id) {

  let answer = {};

  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      answer[item] = urlDatabase[item];
    }
  }

  return answer;

};


// ---------- ROUTES ---------- //

// HOMEPAGE //
app.get("/", (req, res) => {
// if logged in or not:
  if (!req.session.user_id) {
    return res.redirect('/login')
  }
  res.redirect('/urls')
});

// URL PAGE INDEX WITH THE URLS INPUTTED //
app.get("/urls", (req, res) => {
  let cookie = req.session.user_id;
  let templateVars = { urlDatabase, urls: checkUserLink(cookie), user: users[cookie], error: users[cookie] ? null : 'Please Login / Register First!' };
  res.render("urls_index", templateVars);
});

// GENERATE NEW SHORT URL //
app.post("/urls", (req, res) => {
  let cookie = req.session.user_id;
  const generatedShortURL = generateRandomString();
  urlDatabase[generatedShortURL] = {
    longURL: req.body.longURL,
    userID: cookie
  };
  res.redirect(`/urls`);
});

// CREATE NEW URL //
app.get("/urls/new", (req, res) => {
  let cookie = req.session.user_id;
  const templateVars = { user: users[cookie] };
  if (!cookie) {
    return res.redirect("/login");
  }
    res.render("urls_new", templateVars);
}); // keep this above the route definition below

// redirect after form submission
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url === true) {
    return res.status(404).send(`ERROR 404: Page not found!`);
  }
  res.redirect(url.longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let cookie = req.session.user_id;
  if (!users[cookie]) {
    return res.status(404).send(`ERROR 404: Page not found!`);
  }
  const short = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[short].longURL = longURL;
  res.redirect(`/urls`);
});

// RUN /urls/new //
app.get("/urls/:shortURL", function(req, res) {
  let cookie = req.session.user_id;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[cookie] };
  res.render("urls_show", templateVars);
});


// DELETE URLS //
app.post("/urls/:shortURL/delete", (req, res) => {
  let cookie = req.session.user_id;
  if (!users[cookie]) {
    return res.status(191).send(`Sorry, you don't have permission to delete this link!`);
  }
  const deleteUrl = req.params.shortURL;
    delete urlDatabase[deleteUrl];
    res.redirect('/urls');
});

// EDIT URLS //
app.post("/urls/:shortURL/edit", (req, res) => {
  let cookie = req.session.user_id;
  let short = req.params.shortURL;
  let userObject = checkUserLink(urlDatabase, users[cookie]);
  if (!userObject[short]) {
    return res.status.send(`ERROR 403: You don't have permission to edit this link!`);
  }
    urlDatabase[short] = req.body.editedURL;
    res.redirect("/urls");
});

// LOGIN //
app.get("/login", (req, res) => {
  let cookie = req.session.user_id;
  const templateVars = { user: users[cookie] };
  res.render("login", templateVars);
});

app.post("/login", function(req, res) {
  let emailForLogin = req.body.email;
  let passForLogin = req.body.password;
  let user = getUserByEmail(emailForLogin, users);

  if (!emailForLogin.length || !passForLogin.length) {
    return res.status(403).send(`ERROR 403: The email / password you have entered is invalid!`);
  }
  
  if (!user) {
    return res.status(403).send(`ERROR 403: The email / password you have entered doesn't match!`);
  }
  
  if (!bcrypt.compareSync(passForLogin, user.passForLogin)) {
    return res.status(403).send(`ERROR 403: The email / password you have entered doesn't match!`);
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

// LOGOUT //
app.post("/logout", function(req, res) {
  req.session = null;
  res.redirect("/urls");
});

// REGISTRATION //
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});

app.post("/register", function(req, res) {
  let emailForLogin = req.body.email;
  let passForLogin = req.body.password;

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send(`ERROR 400: please enter an email and/or password!`);
  } 
  
  if (getUserByEmail(req.body.email)) {
    return res.status(400).send("ERROR 400: the email you have entered is already in use!");
  }
    let userId = generateRandomString();
    const user = {
      userId,
      emailForLogin,
      passForLogin: bcrypt.hashSync(passForLogin, 10)
    };

    users[userId] = user;
    req.session.user_id = userId;
    res.redirect("/urls");
});

// SERVER START //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});