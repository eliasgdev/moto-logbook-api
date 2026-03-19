var db = require("../db/database");

function getAll(req, res) {
  var rutas = db.prepare("SELECT * FROM rutas ORDER BY fecha DESC").all();
  res.json(rutas);
}

function getOne(req, res) {
  var ruta = db.prepare("SELECT * FROM rutas WHERE id = ?").get(req.params.id);
  if (!ruta) return res.status(404).json({ error: "Ruta no encontrada" });
  res.json(ruta);
}

function create(req, res) {
  var destino = req.body.destino;
  var distancia_km = req.body.distancia_km;
  var duracion_min = req.body.duracion_min;
  var clima = req.body.clima;
  var notas = req.body.notas;

  if (!destino || !distancia_km || !duracion_min) {
    return res.status(400).json({ error: "destino, distancia_km y duracion_min son obligatorios" });
  }

  var stmt = db.prepare(
    "INSERT INTO rutas (destino, distancia_km, duracion_min, clima, notas) VALUES (?, ?, ?, ?, ?)"
  );
  var result = stmt.run(destino, distancia_km, duracion_min, clima || null, notas || null);
  res.status(201).json({ id: result.lastInsertRowid, mensaje: "Ruta registrada" });
}

function update(req, res) {
  var ruta = db.prepare("SELECT * FROM rutas WHERE id = ?").get(req.params.id);
  if (!ruta) return res.status(404).json({ error: "Ruta no encontrada" });

  var destino = req.body.destino || ruta.destino;
  var distancia_km = req.body.distancia_km || ruta.distancia_km;
  var duracion_min = req.body.duracion_min || ruta.duracion_min;
  var clima = req.body.clima || ruta.clima;
  var notas = req.body.notas || ruta.notas;

  db.prepare(
    "UPDATE rutas SET destino=?, distancia_km=?, duracion_min=?, clima=?, notas=? WHERE id=?"
  ).run(destino, distancia_km, duracion_min, clima, notas, req.params.id);

  res.json({ mensaje: "Ruta actualizada" });
}

function remove(req, res) {
  var ruta = db.prepare("SELECT * FROM rutas WHERE id = ?").get(req.params.id);
  if (!ruta) return res.status(404).json({ error: "Ruta no encontrada" });
  db.prepare("DELETE FROM rutas WHERE id = ?").run(req.params.id);
  res.json({ mensaje: "Ruta eliminada" });
}

module.exports = { getAll, getOne, create, update, remove };