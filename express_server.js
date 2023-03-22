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

// Routing
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };

  res.render("urls_index", templateVars);
});

//We're going to need two new routes: a GET route to render the urls_new.ejs template (given below) in the browser,
//to present the form to the user; and a POST route to handle the form submission.

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new");
});

//when the form is submitted, it will make a request to POST /urls, and the body will contain one URL-encoded name-value pair with the name longURL
app.post("/urls", (req, res) => {
  // Respond with "OK" by setting the status code to 200.
  const shortURL = generateRandomString();
  const longURL = req.body["longURL"];
  // add this newly added url into the urlDatabase.
  urlDatabase[shortURL] = longURL;
  res.status(200).redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

///u/
app.get("/u/:id", (req, res) => {
  //We redirected to long url
  console.log(req.params.id);
  console.log("urlDatabase =>", urlDatabase);
  res.status(200).redirect(urlDatabase[req.params.id]);
});

//For editing existing url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  console.log(longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

//For deleting the url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//Login Page functionality
app.post("/login", (req, res) => {
  console.log("req.body.username # ", req.body.username);
  res.cookie(`username`, req.body.username);
  res.redirect(`/urls`);
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//This function returns a string of 6 random alphanumeric characters that can be used as an "unique" Short URL id
function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}
