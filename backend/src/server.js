'use strict';

require('dotenv').config();

const { crearApp } = require('./infrastructure/http/app');

const PUERTO = process.env.PORT || 4000;

const app = crearApp();

app.listen(PUERTO, () => {
  console.log(`✅ API de comercio electrónico escuchando en http://localhost:${PUERTO}`);
});
