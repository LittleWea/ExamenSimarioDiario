//Librerias a usar en el modulo
const express = require('express');
const router = express.Router();
const connection = require('../resources/db');

// Ruta para obtener bancos segun un termino
router.post('/obtener', (req, res) => {
  //Verificar inicio de sesion
  if (req.session.user) {
    //Listar bancos
    const query = "SELECT * FROM Bancos WHERE Nombre LIKE CONCAT('%', ?, '%')";
    connection.query(query, [req.body.Buscar], (err, results) => {
      if (err) {
        //Enviar error
        return res.status(201).json({ mensaje: 'Error en la búsqueda', error: err });
      }
      //Enviar respuesta
      return res.status(200).json({ mensaje: 'Datos obtenidos exitosamente', data: results });
    });
  } else {
    //Enviar error
    return res.status(201).json({ mensaje: 'No hay sesión activa' });
  }
});

// Ruta para obtener banco
router.post('/obtenerPorId', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { ID } = req.body;
  //Verificar inicio de sesion
  if (req.session.user) {
    //Obtener banco
    const query = "SELECT * FROM Bancos WHERE ID = ?";
    connection.query(query, [ID], (err, results) => {
      if (err) {
        //Enviar error
        return res.status(201).json({ mensaje: 'Error al crear el usuario', error: err });
      }
      //Enviar respuesta
      res.status(201).json({
        mensaje: 'Información obtenida',
        data: results
      });
    });
  } else {
    //Enviar error
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Ruta para verificar inicio de sesion
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

