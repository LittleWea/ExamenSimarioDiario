// routes/users.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../resources/db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Ruta para crear un usuario
router.post('/create', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, contrasena, nombre, apPaterno, apMaterno, edad, telefono, correo } = req.body;

  const hashedPassword = hashPassword(contrasena);

  const query = 'SELECT * FROM clientes WHERE RFC = ? '; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
  connection.query(query, [rfc], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al crear el usuario', error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ mensaje: 'El RFC ya está en uso' });
    }

    const insertQuery = 'INSERT INTO clientes (RFC, Nombre, ApPaterno, ApMaterno, Edad, Telefono, Correo, Contrasena, FechaAlta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
    connection.query(insertQuery, [rfc, nombre, apPaterno, apMaterno, edad, telefono, correo, hashedPassword, Date.now()], (err, results) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al crear el usuario', error: err });
      }

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: { id: results.insertId, rfc, correo },
      });
    });
  });
});

router.post('/login', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, contrasena} = req.body;

  const hashedPassword = hashPassword(contrasena);

  const query = 'SELECT * FROM clientes WHERE RFC = ? AND Contrasena = ?'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
  connection.query(query, [rfc, hashedPassword], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al crear el usuario', error: err });
    }

    if (results.length <= 0) {
      return res.status(400).json({ mensaje: 'No existe el RFC registrado' });
    }

    return res.status(201).json({
      mensaje: 'Usuario logeado exitosamente',
      data: { id: results.insertId, rfc, access_control: "si"},
    });
  });
});

module.exports = router;
