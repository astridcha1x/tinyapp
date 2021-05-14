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

  return undefined;

};

// ----------- EXPORT ----------- //

module.exports = { generateRandomString, getUserByEmail };