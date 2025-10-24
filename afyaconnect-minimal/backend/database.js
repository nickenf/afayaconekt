const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'hospitals.db');
const db = new sqlite3.Database(dbPath);

// Create hospitals table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      specialties TEXT,
      description TEXT,
      contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add some sample data if the table is empty
  db.get("SELECT COUNT(*) as count FROM hospitals", (err, row) => {
    if (err) {
      console.error('Error checking hospitals count:', err);
      return;
    }

    if (row.count === 0) {
      const sampleHospitals = [
        {
          name: 'Central Hospital',
          location: 'Downtown, City',
          specialties: 'General Medicine, Surgery, Pediatrics',
          description: 'A leading healthcare facility providing comprehensive medical services.',
          contact: 'Phone: (123) 456-7890, Email: info@centralhospital.com'
        },
        {
          name: 'City Medical Center',
          location: 'Uptown, City',
          specialties: 'Cardiology, Orthopedics, Neurology',
          description: 'Specialized medical center focusing on advanced treatments.',
          contact: 'Phone: (123) 456-7891, Email: contact@citymedical.com'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO hospitals (name, location, specialties, description, contact)
        VALUES (?, ?, ?, ?, ?)
      `);

      sampleHospitals.forEach(hospital => {
        stmt.run(
          hospital.name,
          hospital.location,
          hospital.specialties,
          hospital.description,
          hospital.contact
        );
      });

      stmt.finalize();
      console.log('Sample hospitals data inserted');
    }
  });
});

module.exports = db;