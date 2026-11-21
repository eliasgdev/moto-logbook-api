# Moto Logbook API

[![Pruebas](https://github.com/eliasgdev/moto-logbook-api/actions/workflows/pruebas.yml/badge.svg)](https://github.com/eliasgdev/moto-logbook-api/actions/workflows/pruebas.yml)

API REST para llevar la bitácora de tus rutas en moto: destino, distancia, duración, clima y notas, con un resumen de kilómetros y horas rodadas.

Usa Node.js, Express 5 y SQLite a través de `node:sqlite`, que viene incluido en Node, así que no hay dependencias nativas que compilar.

## Correrla

```bash
git clone https://github.com/eliasgdev/moto-logbook-api.git
cd moto-logbook-api
npm install
npm start            # http://localhost:3000
npm test             # 8 pruebas de integración con una base en memoria
```

Requiere Node 22.13 o superior.

| Variable | Por defecto | Para qué |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP |
| `DB_PATH` | `logbook.db` | Archivo de SQLite |

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/rutas?pagina=1&limite=20` | Lista paginada, de la más reciente a la más antigua (máximo 100 por página) |
| `GET` | `/api/rutas/resumen` | Total de rutas, kilómetros y horas |
| `GET` | `/api/rutas/:id` | Una ruta |
| `POST` | `/api/rutas` | Crea una ruta (`201` con encabezado `Location`) |
| `PATCH` | `/api/rutas/:id` | Cambia solo los campos enviados |
| `DELETE` | `/api/rutas/:id` | Borra (`204`) |

```bash
curl -X POST http://localhost:3000/api/rutas \
  -H 'Content-Type: application/json' \
  -d '{"destino":"Villa de Leyva","distancia_km":165.5,"duracion_min":210,"clima":"soleado"}'
```

### Campos

| Campo | Tipo | Reglas |
|---|---|---|
| `destino` | texto | obligatorio, 1–120 caracteres |
| `distancia_km` | número | obligatorio, 0,1–5000 |
| `duracion_min` | entero | obligatorio, 1–4320 |
| `clima` | texto | `soleado`, `nublado`, `lluvia`, `tormenta`, `niebla` o `viento` |
| `notas` | texto | hasta 1000 caracteres |
| `fecha` | `AAAA-MM-DD` | por defecto, hoy |

Si algo no cumple, la respuesta dice qué campo falló:

```json
{ "error": "Datos inválidos.", "campos": { "distancia_km": "Debe estar entre 0.1 y 5000." } }
```

Los mismos límites están en la API y en restricciones `CHECK` de la base, así que ningún camino guarda datos inválidos. Los campos desconocidos se rechazan, el JSON mal formado devuelve `400` y nunca `500`, y el cuerpo tiene un máximo de 10 KB.

## Estructura

```
src/
├── servidor.js    # arranque
├── app.js         # rutas HTTP (crearApp(db) facilita las pruebas)
├── base.js        # esquema SQLite con restricciones
└── validar.js     # reglas de cada campo
tests/api.test.js
```

## Licencia

MIT

---

<a href="https://avirexis.com/?utm_source=github&utm_medium=readme&utm_campaign=moto-logbook-api"><picture><source media="(prefers-color-scheme: dark)" srcset="https://avirexis.com/avx-logo-nav-white.png"><img src="https://avirexis.com/avx-logo-nav.png" alt="Avirexis" height="22"></picture></a>

Hecho por [Avirexis](https://avirexis.com/?utm_source=github&utm_medium=readme&utm_campaign=moto-logbook-api), software de gestión para negocios hecho en Colombia.
