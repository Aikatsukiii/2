const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS Channel (id INTEGER PRIMARY KEY, name TEXT, count INTEGER, prefix TEXT)');

});
app.use(bodyParser.json()); //middleware to parse JSON request bod

app.get('/channel', (req, res) => {
    db.serialize(() => {
        db.all('SELECT * FROM Channel', [], (err, rows) => {
            res.json(rows);
        });
    })
})
app.post('/channel/create', (req, res) => {
    const { name, count, prefix } = req.body;
    db.serialize(() => {
        console.log(name, count, prefix);
        const stmt = db.prepare('INSERT INTO Channel (name, count, prefix) VALUES (?, ?, ?)');
        stmt.run(name, count, prefix);
        stmt.finalize();
        res.json('successful'); 
    })
})
app.put('/channel/update/:id', (req, res) => {
     const { name, count, prefix } = req.body;
     const { id } = req.params;
     db.serialize(() => {
         const stmt = db.prepare('UPDATE Channel SET name = ?, count = ?, prefix = ? WHERE id = ?');
         stmt.run(name, count, prefix, id);
         stmt.finalize();
         res.json('successful updated');
     })
 })
 app.delete('/channel/delete/:id', (req, res) => {
     const { id } = req.params;
     db.serialize(() => {
         const stmt = db.prepare('DELETE FROM Channel WHERE id = ?');
         stmt.run(id);
         stmt.finalize();
        res.json('delete na');
     })
 })
const server = app.listen(port);