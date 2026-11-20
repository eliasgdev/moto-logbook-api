import { abrirBase } from './base.js';
import { crearApp } from './app.js';

const puerto = Number(process.env.PORT) || 3000;
const app = crearApp(abrirBase());
app.listen(puerto, () => console.log(`Moto Logbook API en http://localhost:${puerto}`));
