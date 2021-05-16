const bcrypt = require("bcrypt");

// ----------- FUNCTIONS ----------- //

// URL DATABASE STORAGE //
const urlDatabase = {};

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
    if (database[user].email === email) {
      return database[user];
    }
  }

  return undefined;

};

// CHECK IF LINKS BELONG TO USER //
const checkUserLink = function(id) {

  let answer = {};

  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      answer[item] = urlDatabase[item];
    }
  }

  return answer;

};

// ----------- EXPORT ----------- //

module.exports = { generateRandomString, getUserByEmail, checkUserLink, urlDatabase };