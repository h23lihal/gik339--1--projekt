//installerar sqlite och kopplar data base
const sqlite = require ('sqlite3') .verbose();
const db = new sqlite.Database('./gik339-labb2.db');  //ersätter den med den riktiga data base


// installerar express och skapar server
const express = require('express'); 
const server = express ();

// Middleware för serverinställningar det är standard inställnigar
server
 .use(express.json())
 .use(express.urlencoded({ extended: false }))
 .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
 });


//Starta servern
server.listen(3000, ()=>{
    console.log('server is running on http://localhost:3000.')
});


// Hantera GET-förfrågningar till users
server.get('/users', (req,res) => {
    const sql = "select * from users";
    db.all(sql , (err, rows) =>{
        if (err) {
            res .status(500) . send (err);
        }
        else {
            res.send(rows);
        }
    })
});

// sparar en ny user
server.post('/users', (req,res) => {
    const user = req.body;
    const sql = `INSERT INTO users (firstName, lastName, username, color) VALUES
    (?,?,?,?) `;
    db.run(sql, Object.values (user), (err) =>{
        if (err) {
            res .status(500) . send (err);
    } else{
        res.send('Användaren sparades');
    }}
    )
});

server.put('/users', (req, res) => {
    const bodyData = req.body;
    const id = bodyData.id;

    const user = {
        firstName: bodyData.firstName,
        lastName: bodyData.lastName,
        username: bodyData.username,
        color: bodyData.color
    };


    let updateString = ''; 
    const columnsArray = Object.keys(user);
    columnsArray.forEach((column, i) => { 
        updateString += `${column} = "${user[column]}"`; 
        if (i !== columnsArray.length - 1) updateString += ','; 
    });

    const sql = `UPDATE users SET ${updateString} WHERE id = ${id}`;

    db.run(sql, (err) => {
        if (err) {
            res.status(500).send(err); 
        } else {
            res.send('Användaren uppdaterad');
        }
    });
});