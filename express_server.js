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

// FUNCTIONS FROM HELPERS.JS IMPLEMENTATION //
const { urlDatabase, users, generateRandomString, getUserByEmail, checkUserLink } = require ("./helpers");

// ---------- ROUTES ---------- //


// ----- APP.GET ROUTES ----- //

// ROOT URL //
app.get("/", (req, res) => {
// if logged in or not:
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

// URL PAGE INDEX WITH THE URLS INPUTTED //
app.get("/urls", (req, res) => {
  let uId = req.session.user_id;
  let templateVars = { urlDatabase: urlDatabase, urls: checkUserLink(uId), user: users[uId] };
  console.log("templateVars.user:", templateVars.user);
  res.render("urls_index", templateVars);
});

// CREATE NEW URL //
app.get("/urls/new", (req, res) => {
  let uId = req.session.user_id;
  const templateVars = { user: users[uId] };
  // if (!cookie) {
  //   return res.redirect("/login");
  // }
  res.render("urls_new", templateVars);
}); // keep this above the route definition below

// REDIRECT AFTER FORM SUBMISSION //
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url === true) {
    return res.status(404).send(`ERROR 404: Page not found!`);
  }
  res.redirect(url.longURL);
});

// RUN /urls/new //
app.get("/urls/:shortURL", function(req, res) {
  let cookie = req.session.user_id;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[cookie] };
  res.render("urls_show", templateVars);
});

// LOGIN //
app.get("/login", (req, res) => {
  let cookie = req.session.user_id;
  const templateVars = { user: users[cookie] };
  res.render("login", templateVars);
});

// REGISTRATION //
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});


// ----- APP.POST ROUTES ----- //

// GENERATE NEW SHORT URL //
app.post("/urls", (req, res) => {
  let uId = req.session.user_id;
  const generatedShortURL = generateRandomString();
  console.log("before: ", urlDatabase);
  urlDatabase[generatedShortURL] = {
    longURL: req.body.longURL,
    userID: uId
  };
  console.log("after: ", urlDatabase);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let cookie = req.session.user_id;
  if (!users[cookie]) {
    return res.status(404).send(`ERROR 404: Page not found!`);
  }
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
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
  let shortURL = req.params.shortURL;
  let userObject = checkUserLink(urlDatabase, users[cookie]);
  if (!userObject[shortURL]) {
    return res.status.send(`ERROR 403: You don't have permission to edit this link!`);
  }
    urlDatabase[shortURL] = req.body.editedURL;
    res.redirect("/urls");
});

// LOGIN // 
app.post("/login", function(req, res) {
  let emailForLogin = req.body.email;
  let passForLogin = req.body.password;
  let user = getUserByEmail(emailForLogin, users);
  console.log(emailForLogin);
  console.log(user);

  if (!emailForLogin.length || !passForLogin.length) {
    return res.status(403).send(`ERROR 403: The email / password you have entered is invalid!`);
  }
  
  if (!user) {
    console.log("second if statement");
    return res.status(403).send(`ERROR 403: The email / password you have entered doesn't match!`);
  }
  
  if (!bcrypt.compareSync(passForLogin, user.passForLogin)) {
    console.log("third if statement");
    return res.status(403).send(`ERROR 403: The email / password you have entered doesn't match!`);
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

// LOGOUT //
app.post("/logout", function(req, res) {
  console.log("before:", users);  
  req.session = null;
  res.clearCookie('user_id');
  console.log("after:", users);
  res.redirect("/urls");
  
});

// REGISTRATION // 
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