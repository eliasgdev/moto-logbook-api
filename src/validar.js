// Validación de rutas. Devuelve { datos } o { errores: { campo: mensaje } }.
export const LIMITES = Object.freeze({
  destino: { max: 120 },
  distanciaKm: { min: 0.1, max: 5000 },
  duracionMin: { min: 1, max: 4320 },
  clima: ['soleado', 'nublado', 'lluvia', 'tormenta', 'niebla', 'viento'],
  notas: { max: 1000 },
});

const CAMPOS = ['destino', 'distancia_km', 'duracion_min', 'clima', 'notas', 'fecha'];

export function validarRuta(cuerpo, { parcial = false } = {}) {
  const errores = {};
  const datos = {};
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return { errores: { cuerpo: 'Envía un objeto JSON.' } };
  }
  for (const campo of Object.keys(cuerpo)) {
    if (!CAMPOS.includes(campo)) errores[campo] = 'Campo no permitido.';
  }

  const presente = c => cuerpo[c] !== undefined;
  const obligatorio = c => !parcial && !presente(c);

  if (obligatorio('destino')) errores.destino = 'Obligatorio.';
  else if (presente('destino')) {
    const v = typeof cuerpo.destino === 'string' ? cuerpo.destino.trim() : '';
    if (!v) errores.destino = 'Escribe el destino.';
    else if (v.length > LIMITES.destino.max) errores.destino = `Máximo ${LIMITES.destino.max} caracteres.`;
    else datos.destino = v;
  }

  numero('distancia_km', LIMITES.distanciaKm, false);
  numero('duracion_min', LIMITES.duracionMin, true);

  function numero(campo, { min, max }, entero) {
    if (obligatorio(campo)) { errores[campo] = 'Obligatorio.'; return; }
    if (!presente(campo)) return;
    const v = cuerpo[campo];
    if (typeof v !== 'number' || !Number.isFinite(v)) errores[campo] = 'Debe ser un número.';
    else if (entero && !Number.isInteger(v)) errores[campo] = 'Debe ser un número entero.';
    else if (v < min || v > max) errores[campo] = `Debe estar entre ${min} y ${max}.`;
    else datos[campo] = v;
  }

  if (presente('clima') && cuerpo.clima !== null) {
    if (!LIMITES.clima.includes(cuerpo.clima)) errores.clima = `Usa uno de: ${LIMITES.clima.join(', ')}.`;
    else datos.clima = cuerpo.clima;
  } else if (presente('clima')) datos.clima = null;

  if (presente('notas') && cuerpo.notas !== null) {
    if (typeof cuerpo.notas !== 'string') errores.notas = 'Debe ser texto.';
    else if (cuerpo.notas.length > LIMITES.notas.max) errores.notas = `Máximo ${LIMITES.notas.max} caracteres.`;
    else datos.notas = cuerpo.notas.trim() || null;
  } else if (presente('notas')) datos.notas = null;

  if (presente('fecha')) {
    const v = cuerpo.fecha;
    const valida = typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
      && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);
    if (!valida) errores.fecha = 'Usa el formato AAAA-MM-DD.';
    else datos.fecha = v;
  }

  if (parcial && !Object.keys(errores).length && !Object.keys(datos).length) {
    errores.cuerpo = 'No hay nada para actualizar.';
  }
  return Object.keys(errores).length ? { errores } : { datos };
}

export function validarId(texto) {
  return /^[1-9]\d{0,9}$/.test(texto) ? Number(texto) : null;
}
