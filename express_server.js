const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require("bcryptjs");
var cookieSession = require("cookie-session");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const salt = 10;

app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

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

const hashedPassword1 = bcrypt.hashSync("purple-monkey-dinosaur", salt);
const hashedPassword2 = bcrypt.hashSync("dishwasher-funk", salt);
//Users to store and access the users in the app
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword1,
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword2,
  },
};

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello Welcome to Tiny App World!" };
  res.render("hello_world", templateVars);
});

// -- Display the url or view page functionality
app.get("/urls", (req, res) => {
  const { user_id } = req.session;

  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) {
    //return res.redirect("/login");
    return res.send("Login required. Please <a href='/login'>login</a> here");
  }

  // get all the created urls by the user.
  const userUrls = urlsForUser(user_id, urlDatabase);

  const templateVars = { urls: userUrls, user: users[user_id] };

  res.render("urls_index", templateVars);
});

// render create new url form
app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;

  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[user_id],
  };

  res.render("urls_new", templateVars);
});

// render show page
app.get("/urls/:id", (req, res) => {
  const { user_id } = req.session;

  //If the user has not logged in they cannot see the specific url.
  if (!user_id) {
    return res.send("Login required. Please <a href='/login'>login</a> here");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }

  // only creator of the url can access
  const url = urlDatabase[req.params.id];
  if (url.userID !== user_id) {
    return res.send("This action is only permitted to the owner of the URL");
  }

  const templateVars = {
    user: users[user_id],
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
  const { user_id } = req.session;
  //Only Registered Users Can Shorten URLs
  if (!user_id)
    return res
      .status(403)
      .send("403: Unauthorized\n Only Registered Users Can Shorten URLs");

  const shortURL = generateRandomString();
  const { longURL } = req.body;

  // add this newly added url into the urlDatabase.
  urlDatabase[shortURL] = { longURL, userID: user_id };

  res.status(200).redirect(`/urls/${shortURL}`);
});

//editing existing url
app.post("/urls/:id", (req, res) => {
  const { user_id } = req.session;

  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) {
    return res.send("Login required. Please <a href='/login'>login</a> here");
  }

  //If url entered mismatch with the existing url
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }

  // only creator of the url can edit
  const url = urlDatabase[req.params.id];
  if (url.userID !== user_id) {
    return res.send("This action is only permitted to the owner of the URL");
  }

  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect("/urls");
});

//Deleting the url
app.post("/urls/:id/delete", (req, res) => {
  const { user_id } = req.session;

  //If the user has not logged in they cannot create new url and must be directed to login page.
  if (!user_id) {
    return res.send("Login required. Please <a href='/login'>login</a> here");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("URL doses not exists");
  }

  // only creator of the url can delete
  const url = urlDatabase[req.params.id]; // the url of the user
  if (url.userID !== user_id) {
    return res.send("This action is only permitted to the owner of the URL");
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

// --- login existing user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  //check if the email exists in the database
  if (!user) {
    return res.status(404).send("User with this e-mail cannot be found");
  }

  // Password check
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Password Incorrect");
  }

  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

// --- Logout
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/login");
});

// --- render register form
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});

// --- add new user
app.post("/register", (req, res) => {
  //Extract the email and password from the form
  // req.body (body-parser) will get the info from our form

  // es6 syntax
  const { email, password } = req.body;

  //if empty strings --> response = 404 statuscode
  if (!email || !password) {
    return res
      .status(404)
      .send("Either email or password is empty, enter a valid one.");
  }

  if (getUserByEmail(email, users)) {
    return res.status(404).send("User Alredy Exisits");
  }

  //generate the random user id
  const randomUserId = generateRandomString();

  //Password encrytption
  const hashedPassword = bcrypt.hashSync(password, salt);
  users[randomUserId] = {
    id: randomUserId,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = randomUserId;

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
