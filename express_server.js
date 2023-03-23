const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieParser());
//middleware which will translate, or parse the body
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

//create a function to look up if email already exist
const getUserByEmail = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!"); //this will eventually change
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

// render create new url form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// render show page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

// redirect to corresponding longurl
app.get("/u/:id", (req, res) => {
  res.status(200).redirect(urlDatabase[req.params.id]);
});

//adding brand new url to DB
app.post("/urls", (req, res) => {
  // Respond with "OK" by setting the status code to 200.
  const shortURL = generateRandomString();
  const longURL = req.body["longURL"];
  // add this newly added url into the urlDatabase.
  urlDatabase[shortURL] = longURL;
  res.status(200).redirect(`/urls/${shortURL}`);
});

//editing existing url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//deleting the url
app.post("/urls/:id/delete", (req, res) => {
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
  res.cookie("user_id", req.body.username);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
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
  } else if (getUserByEmail(email) != "null") {
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
