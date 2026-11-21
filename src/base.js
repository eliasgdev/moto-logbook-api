import { DatabaseSync } from 'node:sqlite';

export function abrirBase(ruta = process.env.DB_PATH ?? 'logbook.db') {
  const db = new DatabaseSync(ruta);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS rutas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destino TEXT NOT NULL CHECK (length(destino) BETWEEN 1 AND 120),
      distancia_km REAL NOT NULL CHECK (distancia_km > 0 AND distancia_km <= 5000),
      duracion_min INTEGER NOT NULL CHECK (duracion_min BETWEEN 1 AND 4320),
      clima TEXT CHECK (clima IN ('soleado','nublado','lluvia','tormenta','niebla','viento')),
      notas TEXT CHECK (notas IS NULL OR length(notas) <= 1000),
      fecha TEXT NOT NULL DEFAULT (date('now')),
      creada_en TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS rutas_fecha ON rutas (fecha DESC, id DESC);
  `);
  return db;
}
