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


  const WebSocket = require('ws');

  // Skapa en WebSocket-server
  const wss = new WebSocket.Server({ noServer: true });
  
  // Lista över aktiva WebSocket-klienter
  const clients = new Set();
  
  // Hantera anslutningar
  wss.on('connection', (ws) => {
    clients.add(ws);
  
    // Hantera meddelanden från klienten (valfritt)
    ws.on('message', (message) => {
      console.log(`Meddelande från klient: ${message}`);
    });
  
    // Ta bort klient från listan vid stängning
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  // Skicka uppdateringar till alla anslutna klienter
  function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Koppla ihop WebSocket-servern med Express-servern
  const servers = require('http').createServer(server);
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
  
// Hämta högsta ID vid serverstart
db.get("SELECT MAX(id) AS maxId FROM books", (err, row) => {
  if (err) {
    console.error("Kunde inte hämta högsta ID:", err.message);
  } else {
    currentId = row.maxId ? row.maxId + 1 : 123456; // Om inga böcker finns, börja från 123456
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
      const newBook = { id: autoId, ...book };
      broadcast({ event: 'bookAdded', data: newBook });

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
      broadcast({ event: 'bookUpdated', data: updatedBook });

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
          broadcast({ event: 'bookDeleted', data: { id: bookId } });

          res.send(`Boken med ID ${bookId} har tagits bort.`);
      }
  });
});