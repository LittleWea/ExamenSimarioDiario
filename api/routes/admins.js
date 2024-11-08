// routes/users.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../resources/db');
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
router.post('/create', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  console.log("Hola")
  const { correo, contrasena, estatus  } = req.body;

  const hashedPassword = hashPassword(contrasena);

  const query = 'SELECT * FROM administradores WHERE correo = ? '; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
  connection.query(query, [correo], (err, results) => {
    if (err) {
      return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
    }

    if (results.length > 0) {
      return res.status(201).json({ mensaje: 'El correo ya está en uso', error: { Error: true } });
    }

    const insertQuery = 'INSERT INTO administradores (correo, contrasena, estatus) VALUES (?, ?, ?)'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
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

router.post('/login', (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { correo, contrasena } = req.body;

  const hashedPassword = hashPassword(contrasena);

  const query = 'SELECT * FROM administradores WHERE Correo = ? AND Contrasena = ?'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
  connection.query(query, [correo, hashedPassword], (err, results) => {
    if (err) {
      return res.status(201).json({ mensaje: 'Error al crear el usuario', error: { Error: true, error: err } });
    }

    if (results.length <= 0) {
      return res.status(201).json({ mensaje: 'No existe el Correo registrado', error: { Error: true } });
    }

    req.session.user = { correo: correo };
    return res.status(201).json({
      mensaje: 'Usuario logeado exitosamente',
      data: { id: results.insertId,correo, access_control: "si" },
    });
  });
});
router.post('/onAgregarBanco', async (req, res) => {
  const { Nombre, Interes, Anios, Enganche, correo } = req.body;

  if (req.session.user && req.session.user.correo) {
    const query = 'SELECT * FROM Bancos WHERE Nombre = ? AND Interes = ? AND Anios = ? AND Enganche = ?';
    connection.query(query, [ Nombre, Interes, Anios, Enganche], (err, results) => {
      if (err) {
        return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
      }

      if (results.length > 0) {
        return res.status(201).json({ mensaje: 'El banco con las especificaciones ya existe', error: { Error: true } });
      }

      const insertQuery = 'INSERT INTO Bancos (Nombre, Interes, Anios, Enganche) VALUES (?, ?, ?, ?)';
      connection.query(insertQuery, [ Nombre, Interes, Anios, Enganche], (err, results) => {
        if (err) {
          return res.status(201).json({ mensaje: 'Error al crear el Banco', error: { Error: true, error: err } });
        }

        return res.status(201).json({
          mensaje: 'Banco creado exitosamente',
          data: {  Nombre, Interes, Anios, Enganche, },
        });
      });
    });
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});
router.post('/onGuardarBanco', async (req, res) => {
  const {  Nombre, Interes, Anios, Enganche, ID, correo } = req.body;

  if (req.session.user && req.session.user.correo) {
    const query = 'UPDATE Bancos SET Nombre = ?, Interes = ?, Anios = ?, Enganche = ? WHERE ID = ?';
    connection.query(query, [ Nombre, Interes, Anios, Enganche, ID], (err, results) => {
      if (err) {
        return res.status(200).json({ mensaje: 'Error al actualizar el Banco', error: { Error: true, error: err } });
      }

      return res.status(200).json({
        mensaje: 'Banco actualizado exitosamente',
        data: { ID,  Nombre, Interes, Anios, Enganche },
      });
    });
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/onEliminarBanco', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { idBanco, correo } = req.body;

  if (req.session.user.correo) {
    
      const query = 'DELETE FROM Bancos WHERE ID = ?';
      connection.query(query, [idBanco], (err, results) => {
        if (err) {
          return res.status(200).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }

        return res.status(200).json({
          mensaje: 'Banco eliminado exitosamente',
          data: { ok: true },
        });
      });
    
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/onModificarBancos', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const {Nombre, Interes, Anios, Enganche, ID, correo } = req.body;
  
  let flag = true
  if (req.session.user.correo) {
    
      
        const query = 'UPDATE Bancos SET Nombre = ?, Interes = ?, Anios = ?, Enganche = ? WHERE ID = ?';
        connection.query(query, [Nombre, Interes, Anios, Enganche, ID], (err, results) => {
          if (err) {
            flag = false
          }
        });

        if (flag === false) {

          return res.status(200).json({ mensaje: 'Error de base de datos', error: { Error: true } });

        } else {
          return res.status(200).json({
            mensaje: 'Bancos actualizados exitosamente',
            data: { ok: true },
          });
        }
      
   
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/onEliminarCliente', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, correo } = req.body;
  
  if (req.session.user.correo) {
    
      const query = 'DELETE FROM Clientes WHERE RFC = ?';
      connection.query(query, [rfc], (err, results) => {
        if (err) {
          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }

        return res.status(201).json({
          mensaje: 'Cliente eliminado exitosamente',
          data: { ok: true },
        });
      });
    
  } else {
    return res.status(200).json({ mensaje: 'No session', error: { Error: true } });
  }
});
router.post('/clientes', async (req, res) => {
  const { correo } = req.query; // Obtenemos el correo del administrador de los parámetros de consulta
  
 
  console.log(req.session.user)
  console.log(req.session.user.correo)
  if (req.session.user && req.session.user.correo) {
    const query = 'SELECT * FROM Clientes';
    connection.query(query, (err, results) => {
      if (err) {
        return res.status(200).json({ mensaje: 'Error al obtener los clientes', error: { Error: true, error: err } });
        
      }
      return res.status(200).json({
        mensaje: 'Lista de clientes obtenida exitosamente',
        data: results,
      });
    });
  } else {
    return res.status(200).json({ mensaje: 'No autorizado', error: { Error: true } });
  }
});
router.post('/bancos', async (req, res) => {
  const { correo } = req.query; // Obtenemos el correo del administrador de los parámetros de consulta
  

  if (req.session.user && req.session.user.correo) {
    const query = 'SELECT * FROM Bancos';
    connection.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al obtener los bancos', error: { Error: true, error: err } });
      }
      return res.status(200).json({
        mensaje: 'Lista de bancos obtenida exitosamente',
        data: results,
      });
    });
  } else {
    return res.status(403).json({ mensaje: 'No autorizado', error: { Error: true } });
  }
});

router.post('/onEliminarUsuario', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfcU, correo } = req.body;
  

  if (req.session.user.correo) {
    
      const query = 'DELETE FROM Clientes WHERE RFC = ?';
      connection.query(query, [rfcU], (err, results) => {
        if (err) {
          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }

        return res.status(201).json({
          mensaje: 'Banco eliminado exitosamente',
          data: { ok: true },
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

