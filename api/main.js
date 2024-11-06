// index.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();
const port = 3000;

const connection = require('./resources/db');

// Middleware para parsear JSON
app.use(express.json());

app.use(cors({
  origin: 'http://localhost', // Cambia esto por el origen de tu cliente si es necesario
  methods: 'GET,POST,PUT,DELETE',
  credentials: true // Habilita las cookies y encabezados de sesión en la solicitud
}));

app.use(
  session({
    secret: 'RemBestGirl',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 minuto
  })
);

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
