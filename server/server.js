// Installerar SQLite och kopplar till databasen
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./books.db'); // Ansluter till databasen

// Installerar Express och skapar server
const express = require('express');
const server = express();

// Håller koll på ID (simulerar lokal lagring)
let currentId = 123456; // Startvärde

// Middleware för serverinställningar
server
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
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
      res.send(rows);
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
      res.send(`Boken med ID ${autoId} har sparats.`);
    }
  });
});

// Uppdatera en bok
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
      res.send(`Boken med ID ${id} har uppdaterats.`);
    }
  });
});
