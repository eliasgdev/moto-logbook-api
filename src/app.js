import express from 'express';
import { validarRuta, validarId } from './validar.js';

const COLUMNAS = 'id, destino, distancia_km, duracion_min, clima, notas, fecha';

export function crearApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  const q = {
    listar: db.prepare(`SELECT ${COLUMNAS} FROM rutas ORDER BY fecha DESC, id DESC LIMIT ? OFFSET ?`),
    contar: db.prepare('SELECT count(*) AS total, coalesce(sum(distancia_km), 0) AS km, coalesce(sum(duracion_min), 0) AS minutos FROM rutas'),
    una: db.prepare(`SELECT ${COLUMNAS} FROM rutas WHERE id = ?`),
    borrar: db.prepare('DELETE FROM rutas WHERE id = ?'),
  };

  app.get('/', (_req, res) => res.json({ nombre: 'moto-logbook-api', estado: 'ok' }));

  app.get('/api/rutas', (req, res) => {
    const limite = Math.min(Math.max(Number.parseInt(req.query.limite, 10) || 20, 1), 100);
    const pagina = Math.max(Number.parseInt(req.query.pagina, 10) || 1, 1);
    const rutas = q.listar.all(limite, (pagina - 1) * limite);
    const { total } = q.contar.get();
    res.json({ rutas, pagina, limite, total });
  });

  app.get('/api/rutas/resumen', (_req, res) => {
    const { total, km, minutos } = q.contar.get();
    res.json({ rutas: total, kilometros: Math.round(km * 10) / 10, horas: Math.round((minutos / 60) * 10) / 10 });
  });

  app.get('/api/rutas/:id', (req, res) => {
    const id = validarId(req.params.id);
    const ruta = id && q.una.get(id);
    if (!ruta) return res.status(404).json({ error: 'Ruta no encontrada.' });
    res.json(ruta);
  });

  app.post('/api/rutas', (req, res) => {
    const { datos, errores } = validarRuta(req.body);
    if (errores) return res.status(400).json({ error: 'Datos inválidos.', campos: errores });
    const campos = Object.keys(datos);
    const r = db.prepare(`INSERT INTO rutas (${campos.join(', ')}) VALUES (${campos.map(() => '?').join(', ')})`)
      .run(...campos.map(c => datos[c]));
    res.status(201).location(`/api/rutas/${r.lastInsertRowid}`).json(q.una.get(r.lastInsertRowid));
  });

  app.patch('/api/rutas/:id', (req, res) => {
    const id = validarId(req.params.id);
    if (!id || !q.una.get(id)) return res.status(404).json({ error: 'Ruta no encontrada.' });
    const { datos, errores } = validarRuta(req.body, { parcial: true });
    if (errores) return res.status(400).json({ error: 'Datos inválidos.', campos: errores });
    // Los nombres de columna vienen de la lista cerrada de validarRuta, nunca del cliente.
    const campos = Object.keys(datos);
    db.prepare(`UPDATE rutas SET ${campos.map(c => `${c} = ?`).join(', ')} WHERE id = ?`)
      .run(...campos.map(c => datos[c]), id);
    res.json(q.una.get(id));
  });

  app.delete('/api/rutas/:id', (req, res) => {
    const id = validarId(req.params.id);
    const r = id ? q.borrar.run(id) : { changes: 0 };
    if (!r.changes) return res.status(404).json({ error: 'Ruta no encontrada.' });
    res.status(204).end();
  });

  app.use((_req, res) => res.status(404).json({ error: 'No existe esa ruta de la API.' }));

  // JSON mal formado o error inesperado: respuesta clara, sin detalles internos.
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'El cuerpo no es JSON válido.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'El cuerpo es demasiado grande.' });
    console.error(err);
    res.status(500).json({ error: 'Error interno.' });
  });

  return app;
}
