const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieParser());
//middleware which will translate, or parse the body
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//Users to store and access the users in the app
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
};

// returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id) => {
  let userUrls = {};

  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

app.get("/", (req, res) => {
  res.send("Hello!"); //this will eventually change
});

app.get("/urls", (req, res) => {
  const { user_id } = req.cookies;
  //If the user has notuser_id logged in they cannot create new url and must be directed to login page.
  if (!user_id) {
    return res.redirect("/login");
  }

  const userUrls = urlsForUser(user_id);
  let templateVars = { urls: userUrls, user: users[user_id] };

  res.render("urls_index", templateVars);
});

// render create new url form
app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;

  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) return res.redirect("/login");
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_new", templateVars);
});

// render show page
app.get("/urls/:id", (req, res) => {
  const { user_id } = req.cookies;

  //If the user has not logged in they cannot see the specific url.
  if (!user_id) return res.redirect("/login");

  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };

  res.render("urls_show", templateVars);
});

// redirect to corresponding longurl
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }
  res.status(200).redirect(urlDatabase[req.params.id].longURL);
});

//adding brand new url to DB
app.post("/urls", (req, res) => {
  // Respond with "OK" by setting the status code to 200.
  const { user_id } = req.cookies;
  //Only Registered Users Can Shorten URLs
  if (!user_id)
    return res
      .status(403)
      .send("403: Unauthorized\n Only Registered Users Can Shorten URLs");

  const shortURL = generateRandomString();
  const longURL = req.body["longURL"];

  // add this newly added url into the urlDatabase.
  urlDatabase[shortURL] = { longURL: longURL, userID: user_id };

  res.status(200).redirect(`/urls/${shortURL}`);
});

//editing existing url
app.post("/urls/:id", (req, res) => {
  const { user_id } = req.cookies;
  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) return res.send("Login to Edit");
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }
  const userUrl = urlsForUser(id); // the url of the user
  for (id in userUrl) {
    if (req.params.id !== userUrl[id]) {
      return res.send("This action is only permitted to the owner of the URL");
    }
  }

  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

//deleting the url
app.post("/urls/:id/delete", (req, res) => {
  const { user_id } = req.cookies;
  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) return res.send("Login required");
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }
  const userUrl = urlsForUser(id); // the url of the user
  for (id in userUrl) {
    if (req.params.id !== userUrl[id]) {
      return res.send("This action is only permitted to the owner of the URL");
    }
  }

  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//render login form
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("login", templateVars);
});

//login existing user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (user === null) {
    res.status(404).send("User with this e-mail cannot be found");
    return;
  }
  // Password check
  if (user.password !== password) {
    console.log("Password Incorrect");
    return res.status(400).send("Password Incorrect");
  }
  res.cookie("user_id", user.id);
  res.redirect(`/urls`);
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//render register form
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});

// add new user
app.post("/register", (req, res) => {
  //Extract the email and password from the form
  // req.body (body-parser) will get the info from our form
  //generate the random user id

  const randomUserId = generateRandomString();
  // es6 syntax
  const { email, password } = req.body;
  //if empty strings --> response = 404 statuscode
  if (email === "" || password === "") {
    console.log("404 Empty email");
    res
      .status(404)
      .send("Either email or password is empty, enter a valid one.");
  } else if (getUserByEmail(email) !== null) {
    console.log("already exists!");
    res.status(404).send("User Alredy Exisits");
  }
  users[randomUserId] = {
    id: randomUserId,
    email: email,
    password: password,
  };

  res.cookie("user_id", randomUserId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
