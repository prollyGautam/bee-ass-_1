document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('book-form');
    const booksTableBody = document.querySelector('#books-table tbody');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const fetchBooks = async (query = '') => {
        const response = await fetch(`/api/books${query}`);
        const books = await response.json();
        booksTableBody.innerHTML = '';
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.genre}</td>
                <td>${book.publicationYear}</td>
                <td>${book.id}</td>
                <td>
                    <button class="edit" data-id="${book.id}">Edit</button>
                    <button class="delete" data-id="${book.id}">Delete</button>
                </td>
            `;
            booksTableBody.appendChild(row);
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await fetch(`/api/books/${id}`, { method: 'DELETE' });
                fetchBooks();
            });
        });

        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const row = e.target.closest('tr');
                document.getElementById('title').value = row.cells[0].textContent;
                document.getElementById('author').value = row.cells[1].textContent;
                document.getElementById('genre').value = row.cells[2].textContent;
                document.getElementById('publicationYear').value = row.cells[3].textContent;
                bookForm.dataset.id = id;
            });
        });
    };

    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(bookForm);
        const data = {
            title: formData.get('title'),
            author: formData.get('author'),
            genre: formData.get('genre'),
            publicationYear: formData.get('publicationYear')
        };

        const id = bookForm.dataset.id;
        if (id) {
            await fetch(`/api/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            delete bookForm.dataset.id;
        } else {
            await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        bookForm.reset();
        fetchBooks();
    });

    const searchBooks = () => {
        const query = searchInput.value.trim();
        fetchBooks(query ? `?query=${query}` : '');
    };

    searchButton.addEventListener('click', searchBooks);

    fetchBooks();
});