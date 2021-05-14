const bcrypt = require("bcrypt");

// ----------- FUNCTIONS ----------- //

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

};

// CHECK FOR PASSWORD IN DATABASE //
const checkForPassword = function(email, password, users) {

  for (let user in users) {
    if (users[user].email === email) {
      return bcrypt.compareSync(password, users[user].password);
    }
  }

};

// LINK CHECKER (for user) //
const checkUserLink = function(object, id) {

  let answer = {};

  for (let item in object) {
    if (object[item].userID === id) {
      answer[item] = object[item];
    }
  }

  return answer;

};

// ----------- EXPORT ----------- //

module.exports = { generateRandomString, getUserByEmail, checkForPassword, checkUserLink };