const express = require('express');
const uuid = require('uuid');
const fs = require('fs');

const app = express();

app.use(express.json());

let authors = [];
let books = [];

let authorID = 1;
let bookID = 1;

//creating new author

app.post('/author', (req, res) => {
    const { name } = req.body;
    const existingAuthor = authors.find(x => x.name === name.trim());
    if(existingAuthor){
        return res.status(400).send({ message: 'Author already exists' });
    }

    const author = {
        id: authorID,
        name: name.trim()
    };

    authors = [...authors, author];

    fs.appendFile('log.txt', `New author added with name ${author.name} and id ${authorID}\n`,
    (err) => {
        if(err){
            console.log(err)
        }
    });

    authorID = authorID+1;

    res.status(201).send(author);
});

//creating new book

app.post('/book', (req, res) => {
    const{ author_id, bookName } = req.body;
    const author = authors.find(x => x.id === +author_id);
    if(!author){
        return res.status(400).send({ message: 'Author does not exists'});
    }

    const existingBook = books.find(y => y.bookName === bookName.trim());
    if(existingBook){
        return res.status(400).send({ message: 'Book already exists' });

    }

    const book = {
        id: bookID,
        author_id,
        bookName: bookName.trim(),
        ISBN: uuid.v4()
    };

    books = [...books, book];

    fs.appendFile('log.txt', `New book added with name ${book.bookName} and id ${book.id}\n`,
    (err) => {
        if(err){
            console.log(err);
        }
    });

    bookID = bookID+1;
    res.status(201).send(book);

});

//getting all authors

app.get('/author', (req, res)=> {
    fs.appendFile('log.txt', `Requested all authors \n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });
    res.send(authors);
});

//getting all books

app.get('/book', (req, res)=>{
    fs.appendFile('log.txt', `Requested all books \n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });
    res.send(books);
});

//getting book by id

app.get('/book/:id', (req, res)=>{
    const book = books.find(y => y.id === +req.params.id);
    if(!book){
        return res.status(404).send({ message: "Book does not exists" });
    }

    fs.appendFile('log.txt', `Requested book with id ${book.id}\n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });

    const author = authors.find(x => x.if === book.author_id);
    res.send({ book, author });
});

//getting author by id

app.get('/author/:id', (req, res)=>{
    const author = authors.find(x => x.id === +req.params.id);
    if(!author){
        return res.status(404).send({ message: "Author does not exists" });
    }

    fs.appendFile('log.txt', `Requested author with id ${author.id}\n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });

    const authorBooks = books.filter(y => +y.author_id === +author.id);
    res.send({ author, books: authorBooks });
});

// updating author name

app.patch('/author/:id', (req, res)=>{
    const author = authors.find(x => x.id === +req.params.id);
    if(!author){
        return res.status(404).send({ message: 'Author does not exists' });

    }

    const { name } = req.body;
    if(!name){
        return res.status(400).send({ message: 'Name is required' });
    }

    const existingAuthor = author.find(x => x.name === name.trim());
    if(existingAuthor){
        return res.status(400).send({ message: "Author already exists" });
    }

    author.name = name.trim();

    fs.appendFile('log.txt', `Details of Author updated with name ${author.name} and id ${author.id}\n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });
    res.send(author);
});

// updating book name

app.patch('/book/:id', (req, res)=>{
    const book = books.find(y=> y.id === +req.params.id);
    if(!book){
        return res.status(404).send({ message: "Book does not exist" });
    }
    
    const { author_id, bookName, ISBN } = req.body;
    const author = authors.find(x => x.id === author_id);
    if(!author){
        return res.status(404).send({ message: "Author does not exists"});
    }

    const existingBook = books.find(y => y.ISBN === ISBN && y.id !== book.id);
    if(existingBook){
        return res.status(400).send({ message: "ISBN already exists" });
    }

    book.author_id = author_id;
    book.bookName = bookName.trim();
    book.ISBN = ISBN;

    fs.appendFile('log.txt', `Details of book with name ${book.bookName} and id ${book.id} updated\n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });

    res.send({ message: 'Book updated successfully', book });
});

// deleting by author id 

app.delete('/author/:id', (req, res)=>{
    const author = authors.find(x => x.id === +req.params.id);
    if(!author){
        return res.status(404).send({ message: "Author deos not exists" });
    }

    fs.appendFile('log.txt', `Author deleted with name ${author.name} and id ${author.id}\n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });

    authors = authors.filter(x => x.id !== author.id);
    books = books.filter(y => y.author_id !== author.id);
    res.send({ message: "Author deleted successfully" });
});

// deleting by book id

app.delete('/book/:id', (req, res)=>{
    const book = books.find(y => y.id === +req.params.id);
    if(!book){
        return res.status(404).send({ message: "Book does not exists" });
    }

    fs.appendFile('log.txt', `Book deleted with name ${book.bookName} and id ${book.id}\n`,
    (err)=>{
        if(err){
            console.log(err);
        }
    });

    books = books.filter(y => y.id !== book.id);
    res.send({ message: 'Book Deleted successfully' });
});

const port = 3000

app.listen(3000, () => {
    console.log(`Server is listening on port 3000`);
});