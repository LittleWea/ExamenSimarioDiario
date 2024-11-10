// Librerias a usar 
const express = require('express');
const session = require('express-session');
const cors = require('cors');

// Importa el archivo de rutas
const userRoutes = require('./routes/usuario');
const bancosRoutes = require('./routes/bancos');
const adminsRoutes = require('./routes/admins');

const app = express();
const port = 3000;

//Ruta a la base de datps
const connection = require('./resources/db');

// Middleware para parsear JSON
app.use(express.json());

//CORS solo en pruebas
app.use(cors({
  origin: 'http://localhost', // Cambia esto por el origen de tu cliente si es necesario
  methods: 'GET,POST,PUT,DELETE',
  credentials: true // Habilita las cookies y encabezados de sesión en la solicitud
}));

//Sesiones
app.use(
  session({
    secret: 'RemBestGirl',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,         // Expiración de la cookie en ms
      sameSite: 'lax',       // Cambiar a 'none' si usas HTTPS en producción
      secure: false          // Cambia a true si usas HTTPS en producción
    } // 1 minuto
  })
);

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
