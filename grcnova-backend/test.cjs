const bcrypt = require("bcrypt");

bcrypt.hash("Test@123", 10).then(hash => {
  console.log("Hashed password:", hash);
});