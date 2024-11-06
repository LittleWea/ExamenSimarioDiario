// routes/users.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../resources/db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/login', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { correo, contrasena} = req.body;

  const hashedPassword = hashPassword(contrasena);

  const query = 'SELECT * FROM Administradores WHERE RFC = ? AND Contrasena = ?'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
  connection.query(query, [correo, hashedPassword], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al crear el usuario', error: err });
    }

    if (results.length <= 0) {
      return res.status(400).json({ mensaje: 'No existe el RFC registrado' });
    }

    return res.status(201).json({
      mensaje: 'Usuario logeado exitosamente',
      data: { correo, access_control: "si"},
    });
  });
});

module.exports = router;
