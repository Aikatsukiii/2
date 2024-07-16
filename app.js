const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors({ origin: 'http://localhost:3000' })); //cors connection in frontend

const db = new sqlite3.Database('db.sqlite'); // Create SQLite database

db.serialize(() => { //queries within are executed
    db.run('CREATE TABLE IF NOT EXISTS Channel (id INTEGER PRIMARY KEY, name TEXT, count INTEGER, prefix TEXT)');

});
app.use(bodyParser.json()); //middleware to parse JSON request 

app.get('/channel', (req, res) => { // get all data 
    db.serialize(() => {
        db.all('SELECT * FROM Channel', [], (err, rows) => {
            res.json(rows);
        });
    })
})

app.post('/channel/create', (req, res) => { // create data 
    const { name, count, prefix } = req.body;
    db.serialize(() => {
        console.log(name, count, prefix);
        const stmt = db.prepare('INSERT INTO Channel (name, count, prefix) VALUES (?, ?, ?)');
        stmt.run(name, count, prefix);
        stmt.finalize();
        res.json('successful'); 
    })
})
app.put('/channel/update/:id', (req, res) => { // update data 
     const { name, count, prefix } = req.body;
     const { id } = req.params;
     db.serialize(() => {
         const stmt = db.prepare('UPDATE Channel SET name = ?, count = ?, prefix = ? WHERE id = ?');
         stmt.run(name, count, prefix, id);
         stmt.finalize();
         res.json('successful updated');
     })
 })
 app.delete('/channel/delete/:id', (req, res) => { // delete data 
     const { id } = req.params;
     db.serialize(() => {
         const stmt = db.prepare('DELETE FROM Channel WHERE id = ?');
         stmt.run(id);
         stmt.finalize();
        res.json('delete na');
     })
 })
const server = app.listen(port);