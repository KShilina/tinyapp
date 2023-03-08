const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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

// function to generate random short URL
function generateRandomString() {
  return (result = Math.random().toString(36).substring(2, 8));
}

app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"];
  let userData = users[userID];
  const templateVars = { urls: urlDatabase, user: userData };
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
  let userID = req.cookies["user_id"];
  let userData = users[userID];
  const templateVars = { urls: urlDatabase, user: userData };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.cookies["user_id"];
  let userData = users[userID];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userData,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//route handler for login
app.post("/login", (req, res) => {
  let username = req.body.username;
  const userObj = Object.entries(users).find(
    ([id, user]) => user.email === username
  );
  console.log("Test1:", users);
  console.log("Test1:", userObj);
  res.cookie("user_id", userObj[0]);
  //console.log("Request cookies:",req.cookies);
  res.redirect("/urls");
});

//POST route for /logout which clears the cookie and redirects the user to /urls page
app.post("/logout", (req, res) => {
  console.log("Test", req.body);
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//route handler to display register page
app.get("/register", (req, res) => {
  let userID = req.cookies["user_id"];
  let userData = users[userID];
  const templateVars = { urls: urlDatabase, user: userData };
  res.render("register", templateVars);
});

// route handler for registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Invalid email or password!");
    return;
  }

  // userRandomID = id; small object inside the users object = user
  const userObj = Object.entries(users).find(
    ([id, user]) => user.email === email
  );
  const foundEmail = Boolean(userObj);
  if (foundEmail) {
    res.status(400).send("Email is already exist!");
    return;
  }
  const userID = generateRandomString();
  // Add the key-value pair to the database
  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };
  res.cookie("user_id", userID);
  console.log("Users:", users);
  let user = users[userID];

  //console.log("Database:",users);

  const templateVars = { urls: urlDatabase, user: user };
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let userID = req.cookies["user_id"];
  let user = users[userID];
  const templateVars = {user};

  res.render("login", templateVars)
})

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
