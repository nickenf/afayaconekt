const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Get all hospitals
app.get('/api/hospitals', (req, res) => {
  db.all('SELECT * FROM hospitals', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Search hospitals by name or specialties
app.get('/api/hospitals/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.status(400).json({ error: 'Search query is required' });
    return;
  }

  const searchQuery = `%${query}%`;
  db.all(
    `SELECT * FROM hospitals 
     WHERE name LIKE ? 
     OR specialties LIKE ? 
     OR location LIKE ?`,
    [searchQuery, searchQuery, searchQuery],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get hospital by ID
app.get('/api/hospitals/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM hospitals WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }
    res.json(row);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});