// Este archivo es para Vercel - importa el servidor principal
const app = require('../index.js');

// Exportar la app para Vercel
module.exports = app;

// Para debugging en Vercel
console.log('API index.js cargado correctamente');
console.log('App exportada:', typeof app);
