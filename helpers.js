const bcrypt = require("bcrypt");

// ----------- FUNCTIONS ----------- //

// URL DATABASE STORAGE //
const urlDatabase = {};

// USER DATABASE STORAGE //
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

// GENERATE A RANDOM SHORTURL //
const generateRandomString = function() {

  const randomChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += randomChars[Math.floor(Math.random() * randomChars.length)];
  }

  return result;

};

// CHECK FOR EMAIL IN DATABASE //
const getUserByEmail = function(email, database) {

  for (let user in database) {
    if (database[user].emailForLogin === email) {
      return database[user];
    }
  }

  console.log(database);
  return undefined;

};

// CHECK IF LINKS BELONG TO USER //
const checkUserLink = function(uId) {

  let answer = {};

  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === uId) {
      answer[item] = urlDatabase[item];
    }
  }

  return answer;

};

// ----------- EXPORT ----------- //

module.exports = { generateRandomString, getUserByEmail, checkUserLink, urlDatabase, users };