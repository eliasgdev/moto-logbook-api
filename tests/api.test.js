import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { abrirBase } from '../src/base.js';
import { crearApp } from '../src/app.js';

let servidor, url;

before(async () => {
  const app = crearApp(abrirBase(':memory:'));
  await new Promise(r => { servidor = app.listen(0, r); });
  url = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

const pedir = async (metodo, ruta, cuerpo) => {
  const res = await fetch(url + ruta, {
    method: metodo,
    headers: cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: cuerpo === undefined ? undefined : typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });
  const texto = await res.text();
  return { status: res.status, cuerpo: texto ? JSON.parse(texto) : null, headers: res.headers };
};

const valida = { destino: 'Villa de Leyva', distancia_km: 165.5, duracion_min: 210, clima: 'soleado', notas: 'Por la vía a Tunja' };

test('crear, leer, actualizar y borrar una ruta', async () => {
  const creada = await pedir('POST', '/api/rutas', valida);
  assert.equal(creada.status, 201);
  assert.equal(creada.cuerpo.destino, 'Villa de Leyva');
  assert.match(creada.cuerpo.fecha, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(creada.headers.get('location'), `/api/rutas/${creada.cuerpo.id}`);
  assert.equal(creada.headers.get('x-powered-by'), null);

  const leida = await pedir('GET', `/api/rutas/${creada.cuerpo.id}`);
  assert.deepEqual(leida.cuerpo, creada.cuerpo);

  const cambiada = await pedir('PATCH', `/api/rutas/${creada.cuerpo.id}`, { notas: null, duracion_min: 200 });
  assert.equal(cambiada.status, 200);
  assert.equal(cambiada.cuerpo.notas, null);
  assert.equal(cambiada.cuerpo.duracion_min, 200);
  assert.equal(cambiada.cuerpo.destino, 'Villa de Leyva');

  assert.equal((await pedir('DELETE', `/api/rutas/${creada.cuerpo.id}`)).status, 204);
  assert.equal((await pedir('GET', `/api/rutas/${creada.cuerpo.id}`)).status, 404);
  assert.equal((await pedir('DELETE', `/api/rutas/${creada.cuerpo.id}`)).status, 404);
});

test('rechaza datos inválidos y dice qué campo falla', async () => {
  const r = await pedir('POST', '/api/rutas', { destino: '  ', distancia_km: -3, duracion_min: 2.5, clima: 'granizo', extra: 1 });
  assert.equal(r.status, 400);
  assert.deepEqual(Object.keys(r.cuerpo.campos).sort(), ['clima', 'destino', 'distancia_km', 'duracion_min', 'extra']);
});

test('faltan obligatorios', async () => {
  const r = await pedir('POST', '/api/rutas', {});
  assert.equal(r.status, 400);
  assert.equal(r.cuerpo.campos.destino, 'Obligatorio.');
});

test('números como texto no se aceptan', async () => {
  const r = await pedir('POST', '/api/rutas', { ...valida, distancia_km: '100' });
  assert.equal(r.cuerpo.campos.distancia_km, 'Debe ser un número.');
});

test('fecha imposible se rechaza', async () => {
  const r = await pedir('POST', '/api/rutas', { ...valida, fecha: '2026-02-30' });
  assert.equal(r.status, 400);
  assert.ok(r.cuerpo.campos.fecha);
});

test('PATCH vacío o con id raro', async () => {
  const { cuerpo } = await pedir('POST', '/api/rutas', valida);
  assert.equal((await pedir('PATCH', `/api/rutas/${cuerpo.id}`, {})).status, 400);
  assert.equal((await pedir('PATCH', '/api/rutas/abc', { notas: 'x' })).status, 404);
  assert.equal((await pedir('GET', '/api/rutas/1;DROP TABLE rutas')).status, 404);
});

test('JSON mal formado da 400 y no 500', async () => {
  const r = await pedir('POST', '/api/rutas', '{"destino":');
  assert.equal(r.status, 400);
  assert.equal(r.cuerpo.error, 'El cuerpo no es JSON válido.');
});

test('listado paginado y resumen', async () => {
  for (let i = 0; i < 3; i++) await pedir('POST', '/api/rutas', { ...valida, distancia_km: 10, duracion_min: 30 });
  const l = await pedir('GET', '/api/rutas?limite=2&pagina=1');
  assert.equal(l.cuerpo.rutas.length, 2);
  assert.ok(l.cuerpo.total >= 3);
  const lim = await pedir('GET', '/api/rutas?limite=5000');
  assert.equal(lim.cuerpo.limite, 100);
  const res = await pedir('GET', '/api/rutas/resumen');
  assert.ok(res.cuerpo.rutas >= 3);
  assert.equal(typeof res.cuerpo.kilometros, 'number');
});
