//This function returns a string of 6 random alphanumeric characters that can be used as an "unique" Short URL id
function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

//checks if email already exist and if not returns email else null
const getUserByEmail = (email, userDb) => {
  for (const userId in userDb) {
    if (email === userDb[userId].email) {
        console.log("userDb[userId] => ", userDb[userId]);
      return userDb[userId];
    }
  }
  return null;
};

// returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};

  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key].longURL;
    }
  }
  return userUrls;
};

getUserByEmail;
module.exports = { getUserByEmail, generateRandomString, urlsForUser };
