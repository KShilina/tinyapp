const getUserByEmail = function (userEmail, users) {
  for (const user in users) {
    if (users[user].email === userEmail){
      return users[user];
    }
  }
  return null;
};

// function to generate random short URL
function generateRandomString() {
  return (result = Math.random().toString(36).substring(2, 8));
}

const urlsForUser = function (id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};
