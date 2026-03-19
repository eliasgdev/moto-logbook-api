var Database = require("better-sqlite3");
var db = new Database("logbook.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS rutas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destino TEXT NOT NULL,
    distancia_km REAL NOT NULL,
    duracion_min INTEGER NOT NULL,
    clima TEXT,
    notas TEXT,
    fecha TEXT DEFAULT (date('now'))
  )
`);

module.exports = db;
