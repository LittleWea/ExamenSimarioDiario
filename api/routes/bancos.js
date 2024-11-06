// routes/users.js
const express = require('express');
const router = express.Router();
const connection = require('../resources/db');

// Ruta para crear un usuario
router.post('/obtener', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { Buscar } = req.body;

  if (req.session.user) {
    const query = "SELECT * FROM Bancos WHERE Nombre LIKE CONCAT('%', ?, '%')"
    connection.query(query, [Buscar], (err, results) => {
      if (err) {
        return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
      }

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: results
      });
    });
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

// Ruta para crear un usuario
router.post('/obtenerPorId', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud

  const { ID } = req.body;
  if (req.session.user) {
    const query = "SELECT * FROM Bancos WHERE ID = ?";
    connection.query(query, [ID], (err, results) => {
      if (err) {
        return res.status(201).json({ mensaje: 'Error al crear el usuario', error: err });
      }

      res.status(201).json({
        mensaje: 'Información obtenida',
        data: results
      });
    });
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/getSession', async (req, res) => {
  if (req.session.user !== undefined) {
    return res.status(201).json({
      mensaje: 'Session ok',
      data: { ok: true },
    });
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

module.exports = router;
