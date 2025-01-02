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


server.get('/books/:id', (req, res) => {
  const id = (req.params.id);
  const sql = `SELECT * FROM books WHERE ID = ${id}`;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows[0]);
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


  const id = bodyData.id;
  const book = {
  Författare: bodyData.Författare,
  Titel: bodyData.Titel,
  Gener: bodyData. Gener,
  };

  
  let updateString = '';
  const columnsArray = Object.keys(book);
  
  columnsArray.forEach((column, i) => {
    updateString += `${column}="${book[column]}"`;
    if (i !== columnsArray.length - 1) updateString += ',';
  });
  
  const sql = `UPDATE books SET ${updateString} WHERE id=?`;
  db.run(sql, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send('Användaren sparades');
    }
  });
  
});

/*   den översta koden är från lektionerna 
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
*/


server.delete('/books/:id', (req, res) => {
  const bookId = req.params.id; // Hämta ID från URL-parametern

  if (!bookId) {
      return res.status(400).send("ID krävs för att ta bort en bok.");
  }

  const sql = `DELETE FROM books WHERE id=${bookId}`;
  db.run(sql, (err) => {
      if (err) {
          res.status(500).send(err);
      } else {

          res.send(`Boken med ID ${bookId} har tagits bort.`);
      }
  });
});





/*
// Importing necessary modules
const express = require('express');
const sqlite = require('sqlite3').verbose();

const server = express();
const db = new sqlite.Database('./books.db'); // Connecting to SQLite database

let currentId = 123456; // Default starting value for IDs

// Middleware for handling JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// CORS headers to allow WebSocket connections
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// Fetch the highest ID at server startup
db.get("SELECT MAX(id) AS maxId FROM books", (err, row) => {
  if (err) {
    console.error("Could not fetch the highest ID:", err.message);
  } else {
    currentId = row.maxId ? row.maxId + 1 : 123456;
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000.');
});

// Handle GET requests to fetch all books
server.get('/books', (req, res) => {
  const sql = "SELECT * FROM books";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send("Error fetching books: " + err.message);
    } else {
      res.json(rows);
    }
  });
});

// Handle GET requests to fetch a specific book by ID
server.get('/books/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM books WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).send("Error fetching book: " + err.message);
    } else if (!row) {
      res.status(404).send("Book not found.");
    } else {
      res.json(row);
    }
  });
});

// Handle POST requests to save a new book
server.post('/books', (req, res) => {
  const { Författare, Titel, Gener } = req.body;

  if (!Författare || !Titel || !Gener) {
    return res.status(400).send("All fields (Författare, Titel, Gener) are required.");
  }

  const autoId = currentId++;
  const sql = "INSERT INTO books (id, Författare, Titel, Gener) VALUES (?, ?, ?, ?)";
  const params = [autoId, Författare, Titel, Gener];

  db.run(sql, params, (err) => {
    if (err) {
      res.status(500).send("Error saving book: " + err.message);
    } else {
      res.send(`Book with ID ${autoId} has been saved.`);
    }
  });
});

// Handle PUT requests to update a book
server.put('/books', (req, res) => {
  const { id, Författare, Titel, Gener } = req.body;

  if (!id) {
    return res.status(400).send("ID is required to update a book.");
  }

  const book = { Författare, Titel, Gener };
  const columns = Object.keys(book).filter(key => book[key] !== undefined);

  if (columns.length === 0) {
    return res.status(400).send("No fields to update.");
  }

  const updateString = columns.map(column => `${column} = ?`).join(', ');
  const values = columns.map(column => book[column]).concat(id);

  const sql = `UPDATE books SET ${updateString} WHERE id = ?`;

  db.run(sql, values, (err) => {
    if (err) {
      res.status(500).send("Error updating book: " + err.message);
    } else {
      res.send(`Book with ID ${id} has been updated.`);
    }
  });
});

// Handle DELETE requests to delete a book by ID
server.delete('/books/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).send("ID is required to delete a book.");
  }

  const sql = "DELETE FROM books WHERE id = ?";
  db.run(sql, [id], (err) => {
    if (err) {
      res.status(500).send("Error deleting book: " + err.message);
    } else {
      res.send(`Book with ID ${id} has been deleted.`);
    }
  });
});
*/