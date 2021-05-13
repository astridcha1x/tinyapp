// ----------- VARIABLES/FUNCS/ESSENTIALS ---------- //

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParset = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// EJS SET AS THE VIEW ENGINE
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GENERATE A RANDOM SHORTURL:
function generateRandomString() {

  const randomChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let result = "";

  for (let i = 0; i < 6; i++){
    result += randomChars[Math.floor(Math.random() * randomChars.length)];
  }

  return result;

};

// ---------- ROUTES ---------- //

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// keep this above the route definition below
app.get("/urls/new", (req, res) => {
  let username = { username: req.cookies["username"] };
  res.render("urls_new", username);
});

app.get("/urls/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];

  res.render("urls_show", { longURL: longURL, shortURL: shortURL, username: req.cookies["username"] });
});

// redirect after form submission
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
});


app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok"); 

  const generateShortURL = generateRandomString();
  urlDatabase[generateShortURL] = req.body.longURL;
  res.redirect(`/urls/${generateShortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  res.redirect(`/urls/${short}`);
});

// deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  // console.log(short);
  delete urlDatabase[short];
  res.redirect("/urls");
});

// editing urls
app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL;
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
});

// login feature
app.post("/login", function(req, res) {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  console.log(req.cookies["username"]);
});

// logout feature
app.post("/logout", function(req, res) {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});