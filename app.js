const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;
    
app.use(cors({ origin: 'http://localhost:3000' })); //cors connection in frontend

const db = new sqlite3.Database('db.sqlite'); // Create SQLite database

db.serialize(() => { //queries within are executed
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT , password TEXT)');  
    db.run('CREATE TABLE IF NOT EXISTS Channel (id INTEGER PRIMARY KEY, name TEXT, count INTEGER, prefix TEXT)');
});

app.use(bodyParser.json()); //middleware to parse JSON request 

app.get('/', function(req, res) {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).json({ message: 'Error fetching users', error: err.message });
        }
        res.json(rows);
    });
})

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    try {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
            if (err) {
                console.error('Error inserting user into database:', err.message);
                return res.status(500).json({ message: 'Error registering user', error: err.message });
            }
            console.log(`User registered with id: ${this.lastID}`);
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Error querying user from database:', err.message);
            return res.status(500).json({ message: 'Error logging in', error: err.message });
        }
        if (!user) {
            // User not found
            console.log('Invalid username:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // Check password
        if (password !== user.password) {
            console.log('Invalid password attempt for username:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // Successful login
        res.status(200).json({ success: true, message: 'Login successful' });
    });
});


app.delete('/login/delete/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting users:', err.message);
            return res.status(500).json({ message: 'Error deleting users', error: err.message });
        }
        res.json({ message: 'users deleted successfully' });
    });
});

//----------------------- Channel ----------------------- 
app.get('/channel', (req, res) => {
    db.all('SELECT * FROM Channel', [], (err, rows) => {
        if (err) {
            console.error('Error fetching channel:', err.message);
            return res.status(500).json({ message: 'Error fetching channel', error: err.message });
        }
        res.json(rows);
    });
});

app.post('/channel/create', (req, res) => {
    const { name, count, prefix } = req.body;
    db.run('INSERT INTO Channel (name, count, prefix) VALUES (?, ?, ?)', [name, count, prefix], function(err) {
        if (err) {
            console.error('Error inserting channel:', err.message);
            return res.status(500).json({ message: 'Error creating channel', error: err.message });
        }
        res.status(201).json({ message: 'Channel created successfully', id: this.lastID });
    });
});

app.put('/channel/update/:id', (req, res) => {
    const { name, count, prefix } = req.body;
    const { id } = req.params;
    db.run('UPDATE Channel SET name = ?, count = ?, prefix = ? WHERE id = ?', [name, count, prefix, id], function(err) {
        if (err) {
            console.error('Error updating channel:', err.message);
            return res.status(500).json({ message: 'Error updating channel', error: err.message });
        }
        res.json({ message: 'Channel updated successfully' });
    });
});

app.delete('/channel/delete/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Channel WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting channel:', err.message);
            return res.status(500).json({ message: 'Error deleting channel', error: err.message });
        }
        res.json({ message: 'Channel deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
