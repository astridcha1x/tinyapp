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
const {generateRandomString, getUserByEmail, checkForPassword, checkUserLink} = require ("./helpers");


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
  let cookie = req.session;
  let userId = req.session.user_id;
  let templateVars = { urls: checkUserLink(userId), user: users[cookie.user_id], error: users[userId] ? null : 'Please Login / Register First!' };
  res.render("urls_index", templateVars);
});

// GENERATE NEW SHORT URL //
app.post("/urls", (req, res) => {
  let cookie = req.session;
  const generatedShortURL = generateRandomString();
  urlDatabase[generatedShortURL] = {
    longURL: req.body.longURL,
    userID: cookie.user_id
  };
  res.redirect(`/urls/${generatedShortURL}`);
});

// CREATE NEW URL //
app.get("/urls/new", (req, res) => {
  let cookie = req.session;
  if (!cookie.user_id) {
    return res.redirect("/login");
  }
    res.render("urls_new", { user: users[cookie.user_id] });
}); // keep this above the route definition below

// // redirect after form submission
// app.get("/u/:shortURL", function(req, res) {
//   let shortURL = req.params.shortURL;
//   res.redirect(urlDatabase[shortURL].longURL);
// });

// app.post("/urls/:shortURL", (req, res) => {
//   const short = req.params.shortURL;
//   res.redirect(`/urls/${short}`);
// });

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
  
  if (!linksOfUser[short]) {
    return res.send("Sorry, you don't have permission to delete this link!");
  }
    delete urlDatabase[short];
    res.redirect("/urls");
});

// EDIT URLS //
app.post("/urls/:shortURL/edit", (req, res) => {
  let cookie = req.session;
  let short = req.params.shortURL;
  let userObject = checkUserLink(urlDatabase, users[cookie.user_id]);
  if (!userObject[short]) {
    return res.status.send("ERROR 403: You don't have permission to edit this link!");
  }
    urlDatabase[short] = req.body.longURL;
    res.redirect("/urls");
});

// LOGIN //
app.get("/login", (req, res) => {
  let userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render("login", templateVars);
});

app.post("/login", function(req, res) {
  let emailForLogin = req.body.email;
  let passForLogin = req.body.password;
  let user = getUserByEmail(emailForLogin, users);
  let passwordCheck = checkForPassword(emailForLogin, passForLogin, users);

  if (!emailForLogin.length || !passForLogin.length) {
    return res.status(403).send(`ERROR 403: The email / password you have entered is invalid!`);
  } else if (!user) {
    return res.status(403).send(`ERROR 403: The email / password you have entered doesn't match!`);
  } else if (!bcrypt.compareSync(passForLogin, user.password)) {
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
  let cookie = req.session;
  res.render("register", { user: users[cookie.user_id] });
});

app.post("/register", function(req, res) {
  let emailForLogin = req.body.email;
  let passForLogin = req.body.password;
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send(`ERROR 400: please enter an email and/or password!`);
  } else if (getUserByEmail(req.body.email)) {
    return res.status(400).send("ERROR 400: the email you have entered is already in use!");
  }
    let userId = generateRandomString();
    const user = {
      userId,
      emailForLogin,
      passForLogin: bcrypt.hashSync(passForLogin, 10)
    };

    console.log("User:, user");

    users[userId] = user;
    req.session.user_id = userId;
    res.redirect("/urls");
});

// SERVER START //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});