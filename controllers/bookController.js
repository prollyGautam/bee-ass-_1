const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dbFilePath = path.join(__dirname, '../db.json');

const getBooksFromFile = () => {
  const data = fs.readFileSync(dbFilePath);
  return JSON.parse(data);
};

const saveBooksToFile = (books) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(books, null, 2));
};

exports.createBook = (req, res) => {
  const { title, author, genre, publicationYear } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and Author are required' });
  }

  const books = getBooksFromFile();
  const newBook = {
    id: uuidv4(),
    title,
    author,
    genre,
    publicationYear
  };
  books.push(newBook);
  saveBooksToFile(books);
  
  res.status(201).json(newBook);
};

exports.getBooks = (req, res) => {
  const { genre, author, publicationYear } = req.query;
  let books = getBooksFromFile();
  
  if (genre) books = books.filter(book => book.genre === genre);
  if (author) books = books.filter(book => book.author === author);
  if (publicationYear) books = books.filter(book => book.publicationYear == publicationYear);
  
  res.json(books);
};

exports.getBookById = (req, res) => {
  const { id } = req.params;
  const books = getBooksFromFile();
  const book = books.find(b => b.id === id);
  
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  res.json(book);
};

exports.updateBook = (req, res) => {
  const { id } = req.params;
  const { title, author, genre, publicationYear } = req.body;
  const books = getBooksFromFile();
  const bookIndex = books.findIndex(b => b.id === id);
  
  if (bookIndex === -1) return res.status(404).json({ message: 'Book not found' });
  
  const updatedBook = { ...books[bookIndex], title, author, genre, publicationYear };
  books[bookIndex] = updatedBook;
  saveBooksToFile(books);
  
  res.json(updatedBook);
};

exports.deleteBook = (req, res) => {
  const { id } = req.params;
  let books = getBooksFromFile();
  const bookIndex = books.findIndex(b => b.id === id);
  
  if (bookIndex === -1) return res.status(404).json({ message: 'Book not found' });
  
  books.splice(bookIndex, 1);
  saveBooksToFile(books);
  
  res.status(204).send();
};

exports.searchBooks = (req, res) => {
  const { title, author, isbn } = req.query;
  let books = getBooksFromFile();
  
  if (title) books = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  if (author) books = books.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
  if (isbn) books = books.filter(book => book.id === isbn);
  
  res.json(books);
};