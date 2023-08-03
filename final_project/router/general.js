const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn
  if (!books[isbn])
    return res.status(404).json({message: "Book not found"})
  return res.status(200).json(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author
  let booksByAuthor = []
  for (isbn in books) {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn])
      }
  }
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title
    let booksWithTitle = []
    for (isbn in books) {
        if (books[isbn].title === title) {
          booksWithTitle.push(books[isbn])
        }
    }
    return res.status(200).json(booksWithTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn
    if (!books[isbn])
      return res.status(404).json({message: "Book not found"})
    return res.status(200).json(books[isbn].reviews);
});

// get books with Promise
async function getBooks() {
    try {
      const response = await axios.get('/');
      const books = response.data;
      return books;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get books');
    }
  }

// get book from isbn with Promise
async function getBookFromIsbn(isbn) {
    try {
      const response = await axios.get(`/isbn/${isbn}`);
      const book = response.data;
      return book;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get book');
    }
  }

// get books from author with Promise
async function getBooksFromAuthor(author) {
    try {
      const response = await axios.get(`/author/${author}`);
      const books = response.data;
      return books;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get book');
    }
  }

// get books from title with Promise
async function getBooksFromTitle(title) {
    try {
      const response = await axios.get(`/title/${title}`);
      const books = response.data;
      return books;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get book');
    }
  }


module.exports.general = public_users;
