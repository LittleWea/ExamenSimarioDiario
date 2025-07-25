//Librerias a usar en el modulo
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../resources/db');
//Funcion para encriptar contraseña
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  // Eliminar la sesión del usuario
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al cerrar la sesión', error: { Error: true, error: err } });
    }

    // Si no hubo errores, redirigimos al usuario a la página de inicio de sesión
    return res.status(200).json({ mensaje: 'Sesión cerrada exitosamente' });
  });
});

// Ruta para crear un usuario
router.post('/create', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, contrasena, nombre, apPaterno, apMaterno, edad, telefono, correo } = req.body;

  //Encriptar contraseña
  const hashedPassword = hashPassword(contrasena);
  //Obtener clientes
  const query = 'SELECT * FROM clientes WHERE RFC = ? ';
  connection.query(query, [rfc], (err, results) => {
    if (err) {
      //Enviar error
      return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
    }

    if (results.length > 0) {
      //Enviar error
      return res.status(201).json({ mensaje: 'El RFC ya está en uso', error: { Error: true } });
    }

    //Insertar cliente
    const insertQuery = 'INSERT INTO clientes (RFC, Nombre, ApPaterno, ApMaterno, Edad, Telefono, Correo, Contrasena, FechaAlta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
    connection.query(insertQuery, [rfc, nombre, apPaterno, apMaterno, edad, telefono, correo, hashedPassword, Date.now()], (err, results) => {
      if (err) {
        //Enviar error
        return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
      }

      //Enviar respuesta
      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: { id: results.insertId, rfc, correo },
      });
    });
  });
});
//Ruta para iniciar sesion
router.post('/login', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, contrasena} = req.body;
//Encriptar contraseña
  const hashedPassword = hashPassword(contrasena);
  //Obtener usuario
  const query = 'SELECT * FROM clientes WHERE RFC = ? AND Contrasena = ?'; 
  connection.query(query, [rfc, hashedPassword], (err, results) => {
    if (err) {
      //Enviar error
      return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
    }

    if (results.length <= 0) {
      //Enviar error
      return res.status(201).json({ mensaje: 'No existe el RFC registrado', error: { Error: true} });
    }

    //Crear sesion
    req.session.user = { rfc: rfc };
    //Enviar respuesta
    return res.status(201).json({
      mensaje: 'Usuario logeado exitosamente',
      data: { id: results.insertId, rfc, access_control: "si"},
    });
  });
});

// Ruta para obtener la información de la sesión y mostrar el nombre del usuario
router.post('/getSession', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ mensaje: 'No session', error: { Error: true } });
    }

    const rfc = req.session.user.rfc;

    // Verifica que el RFC esté presente y correcto
    if (!rfc) {
      return res.status(400).json({ mensaje: 'RFC inválido', error: { Error: true } });
    }
    //Obtener cliente
    const query = 'SELECT Nombre FROM clientes WHERE RFC = ?';
    connection.query(query, [rfc], (err, results) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        //Enviar error
        return res.status(500).json({ mensaje: 'Error al obtener los datos del usuario', error: { Error: true, error: err } });
      }

      //Enviar respuesta
      if (results.length > 0) {
        const nombreUsuario = results[0].Nombre;
        console.log("Nombre de usuario:", nombreUsuario);
        return res.status(200).json({
          mensaje: 'Sesión activa',
          data: { ok: true, Nombre: nombreUsuario },
        });
      } else {
        //Enviar error
        return res.status(404).json({ mensaje: 'Usuario no encontrado', error: { Error: true } });
      }
    });
  } catch (err) {
    //Enviar error
    console.error("Error en el servidor:", err);
    return res.status(500).json({ mensaje: 'Error al obtener los datos del usuario', error: { Error: true } });
  }
});


module.exports = router;
