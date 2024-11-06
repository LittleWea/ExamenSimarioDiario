// index.js
const express = require('express');
const app = express();
const port = 3000;

const connection = require('./resources/db');

// Middleware para parsear JSON
app.use(express.json());

// Importa el archivo de rutas
const userRoutes = require('./routes/usuario');
const bancosRoutes = require('./routes/bancos');
const adminsRoutes = require('./routes/admins');

// Monta las rutas en un prefijo, como "/api/users"
app.use('/usuario', userRoutes);
app.use('/bancos', bancosRoutes);
app.use('/admins', adminsRoutes);

// Ruta de ejemplo en el servidor principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
