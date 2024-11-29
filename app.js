const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;
const booksFilePath = './db.json';

app.use(express.json());
app.use(express.static('public'));

const getBooks = () => {
    const data = fs.readFileSync(booksFilePath);
    return JSON.parse(data);
};

const saveBooks = (books) => {
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2));
};

app.post('/api/books', (req, res) => {
    const { title, author, genre, publicationYear } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }

    const books = getBooks();
    const newBook = { id: uuidv4(), title, author, genre, publicationYear };
    books.push(newBook);
    saveBooks(books);

    res.status(201).json(newBook);
});

app.get('/api/books', (req, res) => {
    const { query } = req.query;
    const books = getBooks();

    if (query) {
        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.id.includes(query)
        );
        return res.json(filteredBooks);
    }

    res.json(books);
});

app.get('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const books = getBooks();
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});

app.put('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, genre, publicationYear } = req.body;
    const books = getBooks();
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const updatedBook = { ...books[bookIndex], title, author, genre, publicationYear };
    books[bookIndex] = updatedBook;
    saveBooks(books);

    res.json(updatedBook);
});

app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const books = getBooks();
    const newBooks = books.filter(b => b.id !== id);
    if (books.length === newBooks.length) {
        return res.status(404).json({ error: 'Book not found' });
    }
    saveBooks(newBooks);

    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is Listening to Port ${PORT}`);
});