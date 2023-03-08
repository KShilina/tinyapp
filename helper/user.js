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

const findUser = function (userEmail) {
  const userObj = Object.entries(users).find(
    ([id, user]) => user.email === userEmail
  );
  return userObj;
};

// function to generate random short URL
function generateRandomString() {
  return (result = Math.random().toString(36).substring(2, 8));
}

module.exports = {
  users,
  findUser,
  generateRandomString,
};
