# Moto Logbook API 🏍️

REST API para registrar y gestionar rutas en moto. Construida con Node.js, Express y SQLite.

## Descripción

Backend completo con operaciones CRUD para llevar un historial de rutas — destino, distancia, duración, clima y notas. Cada ruta se guarda con fecha automática.

## Tecnologías

- Node.js
- Express
- SQLite (better-sqlite3)

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/rutas` | Obtener todas las rutas |
| GET | `/api/rutas/:id` | Obtener una ruta por ID |
| POST | `/api/rutas` | Crear una ruta nueva |
| PUT | `/api/rutas/:id` | Actualizar una ruta |
| DELETE | `/api/rutas/:id` | Eliminar una ruta |

## Ejemplo de uso

**Crear una ruta (POST)**
```json
{
  "destino": "Zipaquirá",
  "distancia_km": 50,
  "duracion_min": 80,
  "clima": "despejado",
  "notas": "Buena vía, poco tráfico"
}
```

**Respuesta**
```json
{
  "id": 1,
  "mensaje": "Ruta registrada"
}
```

## Cómo correrlo

1. Cloná el repositorio
```bash
   git clone https://github.com/eliasgdev/moto-logbook-api.git
```
2. Instalá las dependencias
```bash
   npm install
```
3. Corré el servidor
```bash
   node app.js
```
4. El servidor corre en `http://localhost:3000`

## Estructura del proyecto
```
moto-logbook-api/
├── db/
│   └── database.js
├── routes/
│   └── rutas.js
├── controllers/
│   └── rutasController.js
└── app.js
```

## Autor

**Elias Gutierrez** — [github.com/eliasgdev](https://github.com/eliasgdev)
