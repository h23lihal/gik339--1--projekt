// Installerar nödvändiga moduler
const express = require('express');
const sqlite = require('sqlite3').verbose();
const http = require('http');

// Skapar Express-server och WebSocket-server
const server = express();


const db = new sqlite.Database('./books.db'); // Ansluter till SQLite-databasen

let currentId = 123456; // Startvärde för ID

// Middleware för att hantera JSON- och URL-kodade data
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// Skicka CORS-header för att möjliggöra WebSocket-anslutning
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});


// Hämta högsta ID vid serverstart
db.get("SELECT MAX(id) AS maxId FROM books", (err, row) => {
  if (err) {
    console.error("Kunde inte hämta högsta ID:", err.message);
  } else {
    currentId = row.maxId ? row.maxId + 1 : 123456;
  }
});
 
// Starta servern
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000.');
});

// Hantera GET-förfrågningar till /books
server.get('/books', (req, res) => {
  const sql = "SELECT * FROM books";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Sparar en ny bok
server.post('/books', (req, res) => {
  const book = req.body;

  // Generera nytt ID
  const autoId = currentId++;
  
  const sql = `INSERT INTO books (id, Författare, Titel, Gener) VALUES (?, ?, ?, ?)`;
  const params = [autoId, book.Författare, book.Titel, book.Gener];

  db.run(sql, params, (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const newBook = { id: autoId, ...book };

      res.send(`Boken med ID ${autoId} har sparats.`);
    }
  });
});

server.put('/books', (req, res) => {
  const bodyData = req.body;
  const { id, Författare, Titel, Gener } = bodyData;

  if (!id) {
    return res.status(400).send("ID krävs för att uppdatera en bok.");
  }

  const book = { Författare, Titel, Gener };
  let updateString = '';
  const columnsArray = Object.keys(book);

  columnsArray.forEach((column, i) => {
    if (book[column]) {
      updateString += `${column} = "${book[column]}"`;
      if (i !== columnsArray.length - 1) updateString += ', ';
    }
  });

  const sql = `UPDATE books SET ${updateString} WHERE id = ?`;
  db.run(sql, [id], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      // Skicka realtidsuppdatering via WebSocket
      const updatedBook = { id, ...book };

      res.send(`Boken med ID ${id} har uppdaterats.`);
    }
  });
});

server.delete('/books/:ID', (req, res) => {
  const bookId = req.params.ID; // Hämta ID från URL-parametern

  if (!bookId) {
      return res.status(400).send("ID krävs för att ta bort en bok.");
  }

  const sql = `DELETE FROM books WHERE id = ?`;
  db.run(sql, [bookId], (err) => {
      if (err) {
          res.status(500).send(err.message);
      } else {
          // Skicka realtidsuppdatering via WebSocket

          res.send(`Boken med ID ${bookId} har tagits bort.`);
      }
  });
});