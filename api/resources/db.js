// db.js
const mysql = require('mysql2');

// Crear una conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',        // El host de la base de datos
  user: 'root',             // Tu usuario de MySQL (por defecto en XAMPP es 'root')
  password: '',             // La contraseña (por defecto está vacía)
  database: 'app_cotizaciones' // El nombre de tu base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL como id ' + connection.threadId);
});

module.exports = connection;
