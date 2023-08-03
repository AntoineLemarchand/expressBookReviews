const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    for (user of users) {
        if (user.username === username)
            return false
    }
    return true
}

const authenticatedUser = (username,password)=>{
    for (user of users) {
        if (user.username === username && user.password === password)
            return true
    }
    return false
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization ||
    !req.session.authorization.username ||
    !req.session.authorization.accessToken ||
    !authenticatedUser(req.session.authorization.username,
        jwt.decode(req.session.authorization.accessToken).data) ) {
    return res.status(401).json({message: "Not logged in"})
  }
  if (!req.params.isbn || !books[req.params.isbn]) {
    return res.status(404).json({message: "Book not found"})
  }
  for (username in books[req.params.isbn].reviews) {
      if (username === req.session.authorization.username) {
        books[req.params.isbn].reviews[username] = req.body
          return res.status(200).json({message: "Review modified"})
      }
  }
  books[req.params.isbn].reviews[req.session.authorization.username] = req.body
  return res.status(201).json({message: "Review created"})
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    if (!req.session.authorization ||
      !req.session.authorization.username ||
      !req.session.authorization.accessToken ||
      !authenticatedUser(req.session.authorization.username,
          jwt.decode(req.session.authorization.accessToken).data) ) {
      return res.status(401).json({message: "Not logged in"})
    }
    if (!req.params.isbn || !books[req.params.isbn]) {
      return res.status(404).json({message: "Book not found"})
    }
    for (username in books[req.params.isbn].reviews) {
        if (username === req.session.authorization.username) {
          delete books[req.params.isbn].reviews[username]
        }
    }
    return res.status(200).json({message: "Review deleted"})
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
