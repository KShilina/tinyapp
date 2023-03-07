const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// function to generate random short URL
function generateRandomString() {
  return result = Math.random().toString(36).substring(2,8);
}

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,  username: req.cookies["username"], };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // Add the key-value pair to the database
  urlDatabase[shortURL] = req.body.longURL;
  // Redirect to the newly created short URL page
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],  username: req.cookies["username"], };
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//route handler for login 
app.post('/login', (req, res) => {
  let username = req.body.username
  res.cookie("username", username)
  res.redirect('/urls');
});

//POST route for /logout which clears the cookie and redirects the user to /urls page
app.post('/logout', (req, res) => {
  let username = req.body.username
  res.clearCookie("username", username)
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//route handler to display register page
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("register",templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
