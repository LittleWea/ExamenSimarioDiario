// Librerias necesarias para el funcionamiento del modulo de administradores
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../resources/db');
//Funcion para encriptar contrtaseñas
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

//Ruta de creacion de admin
router.post('/create', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { correo, contrasena, estatus  } = req.body;

  const hashedPassword = hashPassword(contrasena);

  //Busqueda de usuarios con correo igual
  const query = 'SELECT * FROM administradores WHERE correo = ? '; 
  connection.query(query, [correo], (err, results) => {
    //Regresar error
    if (err) {
      return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
    }
    //Regresar error
    if (results.length > 0) {
      return res.status(201).json({ mensaje: 'El correo ya está en uso', error: { Error: true } });
    }

    //Insertar nuevo administrador
    const insertQuery = 'INSERT INTO administradores (correo, contrasena, estatus) VALUES (?, ?, ?)'; 
    connection.query(insertQuery, [correo, hashedPassword, estatus], (err, results) => {
      if (err) {
        return res.status(201).json({ mensaje: 'Hola mundo', error: { Error: true, error: err } });
      }

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        data: { id: results.insertId, correo },
      });
    });
  });
});

//Funcion en des-uso
function esAdmin(correo) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM administradores WHERE Correo = ?';
    connection.query(query, [correo], (err, results) => {
      if (err) {
        console.log("error");
        return resolve(false);
      }

      if (results.length <= 0) {
        console.log("no hay");
        return resolve(false);
      } else {
        console.log("si hay");
        return resolve(true);
      }
    });
  });
}

//Ruta de loggeo para admins
router.post('/login', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { correo, contrasena } = req.body;

  const hashedPassword = hashPassword(contrasena);

  //Comparacion de contraseñas cifradas
  const query = 'SELECT * FROM administradores WHERE Correo = ? AND Contrasena = ?'; 
  connection.query(query, [correo, hashedPassword], (err, results) => {
    //Enviar error
    if (err) {
      return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
    }
    //Enviar error
    if (results.length <= 0) {
      return res.status(201).json({ mensaje: 'No existe el Correo registrado', error: { Error: true } });
    }

    //Loggeo exitoso
    req.session.user = { correo: correo };
    return res.status(201).json({
      mensaje: 'Usuario logeado exitosamente',
      data: { id: results.insertId,correo, access_control: "si" },
    });
  });
});

//Ruta para agregar bancos
router.post('/onAgregarBanco', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { Nombre, Interes, Anios, Enganche, correo } = req.body;

  //Verificar loggeo
  if (req.session.user && req.session.user.correo) {
    //Busqueda de bancos con iguales valores
    const query = 'SELECT * FROM Bancos WHERE Nombre = ? AND Interes = ? AND Anios = ? AND Enganche = ?';
    connection.query(query, [ Nombre, Interes, Anios, Enganche], (err, results) => {

      //Enviar error
      if (err) {
        return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
      }
      //Enviar error
      if (results.length > 0) {
        return res.status(201).json({ mensaje: 'El banco con las especificaciones ya existe', error: { Error: true } });
      }

      //Insertar nuevo banco
      const insertQuery = 'INSERT INTO Bancos (Nombre, Interes, Anios, Enganche) VALUES (?, ?, ?, ?)';
      connection.query(insertQuery, [ Nombre, Interes, Anios, Enganche], (err, results) => {
        if (err) {
          return res.status(201).json({ mensaje: 'Error al crear el Banco', error: { Error: true, error: err } });
        }

        //Enviar respuesta
        return res.status(201).json({
          mensaje: 'Banco creado exitosamente',
          data: {  Nombre, Interes, Anios, Enganche, },
        });
      });
    });
  } else {
    //Enviar error
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Ruta para actualziar banco
router.post('/onGuardarBanco', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const {  Nombre, Interes, Anios, Enganche, ID, correo } = req.body;

  //Verificacion de inicio de sesion
  if (req.session.user && req.session.user.correo) {
    //Actualziar banco
    const query = 'UPDATE Bancos SET Nombre = ?, Interes = ?, Anios = ?, Enganche = ? WHERE ID = ?';
    connection.query(query, [ Nombre, Interes, Anios, Enganche, ID], (err, results) => {
      //Enviar error
      if (err) {
        return res.status(200).json({ mensaje: 'Error al actualizar el Banco', error: { Error: true, error: err } });
      }

      //Enviar respuesta
      return res.status(200).json({
        mensaje: 'Banco actualizado exitosamente',
        data: { ID,  Nombre, Interes, Anios, Enganche },
      });
    });
  } else {
    //Enviar error
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Ruta para eliminar banco
router.post('/onEliminarBanco', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { idBanco, correo } = req.body;

  //Verificar inicio de sesion
  if (req.session.user.correo) {

      //Eliminar banco
      const query = 'DELETE FROM Bancos WHERE ID = ?';
      connection.query(query, [idBanco], (err, results) => {
        if (err) {
          //Enviar error
          return res.status(200).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }

        //Enviar respuesta
        return res.status(200).json({
          mensaje: 'Banco eliminado exitosamente',
          data: { ok: true },
        });
      });
    
  } else {
    //Enviar error
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Ruta para modificar bancos
router.post('/onModificarBancos', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const {Nombre, Interes, Anios, Enganche, ID, correo } = req.body;
  let flag = true
  //Verificar inicio de sesion
  if (req.session.user.correo) {
        //Actualizar banco
        const query = 'UPDATE Bancos SET Nombre = ?, Interes = ?, Anios = ?, Enganche = ? WHERE ID = ?';
        connection.query(query, [Nombre, Interes, Anios, Enganche, ID], (err, results) => {
          if (err) {
            flag = false
          }
        });

        if (flag === false) {
          //Enviar error
          return res.status(200).json({ mensaje: 'Error de base de datos', error: { Error: true } });

        } else {
          //Enviar respuesta
          return res.status(200).json({
            mensaje: 'Bancos actualizados exitosamente',
            data: { ok: true },
          });
        }
  } else {
    //Enviar respuesta
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Ruta para eliminar cliente
router.post('/onEliminarCliente', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, correo } = req.body;

  //Verificar inicio de sesion
  if (req.session.user.correo) {
      //Eliminar cliente
      const query = 'DELETE FROM Clientes WHERE RFC = ?';
      connection.query(query, [rfc], (err, results) => {
        if (err) {
          //Enviar error
          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }
        //Enviar respuesta
        return res.status(201).json({
          mensaje: 'Cliente eliminado exitosamente',
          data: { ok: true },
        });
      });
    
  } else {
    //Enviar error
    return res.status(200).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Ruta para ver clientes
router.post('/clientes', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { correo } = req.query; 
  //Verificar inicio de sesion
  if (req.session.user && req.session.user.correo) {
    //Eliminar cliente
    const query = 'SELECT * FROM Clientes';
    connection.query(query, (err, results) => {
      if (err) {
        //Enviar error
        return res.status(200).json({ mensaje: 'Error al obtener los clientes', error: { Error: true, error: err } });
      }
      //Enivar respuesta
      return res.status(200).json({
        mensaje: 'Lista de clientes obtenida exitosamente',
        data: results,
      });
    });
  } else {
    //Enviar error
    return res.status(200).json({ mensaje: 'No autorizado', error: { Error: true } });
  }
});

//Ruta para listar bancos
router.post('/bancos', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { correo } = req.query;
  //Verificar inicio de sesion
  if (req.session.user && req.session.user.correo) {
    //Listar bancos
    const query = 'SELECT * FROM Bancos';
    connection.query(query, (err, results) => {
      if (err) {
        //Enviar error
        return res.status(500).json({ mensaje: 'Error al obtener los bancos', error: { Error: true, error: err } });
      }
      //Enviar respuesta
      return res.status(200).json({
        mensaje: 'Lista de bancos obtenida exitosamente',
        data: results,
      });
    });
  } else {
    //Enviar error
    return res.status(403).json({ mensaje: 'No autorizado', error: { Error: true } });
  }
});
//Ruta para eliminar usuarios
router.post('/onEliminarUsuario', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfcU, correo } = req.body;
  //Verificar inicio de sesion
  if (req.session.user.correo) {
      //Eliminar usuario
      const query = 'DELETE FROM Clientes WHERE RFC = ?';
      connection.query(query, [rfcU], (err, results) => {
        if (err) {
          //Enviar error
          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }
        //Enviar respuesta
        return res.status(201).json({
          mensaje: 'Banco eliminado exitosamente',
          data: { ok: true },
        });
      });
    
  } else {
    //Enviar error
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

//Obtener sesion
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


