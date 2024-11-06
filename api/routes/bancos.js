// routes/users.js
const express = require('express');
const router = express.Router();
const connection = require('../resources/db');

// Ruta para crear un usuario
router.post('/obtener', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { Buscar } = req.body;

  const query = "SELECT * FROM Bancos WHERE Nombre LIKE CONCAT('%', ?, '%')"
    connection.query(query, [Buscar], (err, results) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al crear el usuario', error: err });
      }
      
      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: results
      });
    });
});

// Ruta para crear un usuario
router.get('/obtenerPorId', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  
  const { ID } = req.body;

  const query = "SELECT * FROM Bancos WHERE ID = ?";
    connection.query(query, [ID], (err, results) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al crear el usuario', error: err });
      }
      
      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: results
      });
    });
});

module.exports = router;
