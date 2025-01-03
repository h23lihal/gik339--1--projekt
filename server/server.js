const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./books.db');

const express = require('express');
const server = express();

server
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');

    next();
  });

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

server.get('/books', (req, res) => {
  const sql = 'SELECT * FROM books';

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows);
    }
  });
});

server.get('/books/:id', (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM books WHERE id=${id}`;

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows[0]);
    }
  });
});

server.post('/books', (req, res) => {
  const books = req.body;
  const sql = `INSERT INTO books (Titel, Författare, Genre, color) VALUES (?,?,?,?)`;

  db.run(sql, Object.values(books), (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send('Boken sparades');
    }
  });
});

server.put('/books', (req, res) => {
  const bodyData = req.body;

  const id = bodyData.id;
  const book = {
    Titel: bodyData.Titel,
    Författare: bodyData.Författare,
    Genre: bodyData.Genre,
    color: bodyData.color,
  };
  let updateString = '';
  const columnsArray = Object.keys(book);
  columnsArray.forEach((column, i) => {
    updateString += `${column}="${book[column]}"`;
    if (i !== columnsArray.length - 1) updateString += ',';
  });
  const sql = `UPDATE books SET ${updateString} WHERE id=${id}`;

  db.run(sql, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send('Boken uppdaterades');
    }
  });
});

server.delete('/books/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM books WHERE id = ${id}`;

  db.run(sql, (err) => {
    if (err) {
      console.log(err);
      res.send(500).send(err);
    } else {
      res.send('Boken borttagen');
    }
  });
});