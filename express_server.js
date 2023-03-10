const express = require("express");
const bcrypt = require("bcryptjs");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const { findUser, users, generateRandomString } = require("./helper/user");
const app = express();
const PORT = 8080; // default port 8080

//app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["Ekaterina"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// set view engine to EJS
app.set("view engine", "ejs");


// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

const urlsForUser = function (id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  let userData = users[userID];
  const templateVars = { urls: urlsForUser(userID), user: userData };
  console.log(urlDatabase);
  if (!userID) {
    res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let userID = req.session.user_id;
  let newItem = { longURL: req.body.longURL, userID: userID };
  // Add the key-value pair to the database
  // urlDatabase[shortURL] = req.body.longURL;
  urlDatabase[shortURL] = newItem;
  if (!userID) {
    res.send("Not authorized to shorten URLs.");
  }
  // Redirect to the newly created short URL page
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let userData = users[userID];
  const templateVars = { urls: urlDatabase, user: userData };
  if (!userID) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.send("You are not login.");
  }

  let userData = users[userID];
  let shortURL = req.params.id;
  console.log(req.params.id);
  if (!urlDatabase[shortURL]) {
    return res.send("The URL is not exist.");
  }
  console.log(urlDatabase);
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send("Not authorise to access URL.");
  }

  // console.log(shortURL);
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: userData,
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  let userID = req.session.user_id;//read the cookie
  if (!userID) {
    return res.send("You are not login.");
  }
  if (!urlDatabase[shortURL]) {
    return res.send("The URL is not exist.");
  }
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send("Not authorise to access URL.");
  }
  res.redirect("/urls");
});

//route handler for login
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let password = req.body.password;

  //let userID = res.cookie("user_id", userID);
  //using helper function to find the user in userObj
  const userObj = findUser(userEmail);
  if (!userObj) return res.status(403).send("Email is not exist.");
  if (!bcrypt.compareSync(password, userObj.password)) {
    res.status(403).send("Password is not correct.");
    return;
  }
  //res.cookie("user_id", userObj.id); //value of the cookie named user_id
  req.session.user_id = userObj.id;
  //console.log("UserObj",userObj);
  //console.log("Request cookies:",req.cookies);
  res.redirect("/urls");
});

//POST route for /logout which clears the cookie and redirects the user to /urls page
app.post("/logout", (req, res) => {
  console.log("Test", req.body);
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  let userID = req.session.user_id;
  if (!userID) {
    return res.send("You are not login.");
  }
  if (!urlDatabase[shortURL]) {
    return res.send("The URL is not exist.");
  }
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send("Not authorised to edit URL.");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.send("Short URL is not exist.");
  }
  res.redirect(longURL);
});

//route handler to display register page
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let userData = users[userID];
  const templateVars = { urls: urlDatabase, user: userData };
  if (userID) {
    res.redirect("/urls");
  }
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
  //using helper function to find users in database
  const userObj = findUser(email);
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
    password: bcrypt.hashSync(password, 10),
  };
  //res.cookie("user_id", userID);
  req.session.user_id = userID;
  console.log("Users:", users);
  let user = users[userID];

  //console.log("Database:",users);

  const templateVars = { urls: urlDatabase, user: user };
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  const templateVars = { user };
  if (userID) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
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
// start server and listen for PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
