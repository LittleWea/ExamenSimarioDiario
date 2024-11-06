// routes/users.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../resources/db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function esAdmin(correo) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Administradores WHERE Correo = ?';
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

  const query = 'SELECT * FROM Administradores WHERE Correo = ? AND Contrasena = ?'; // Asegúrate de que la tabla 'users' tenga la columna 'contrasena'
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
      data: { correo, access_control: "si" },
    });
  });
});

router.post('/onGuardarBanco', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { nombre, interes, anios, enganche, correo } = req.body;
  const isAdmin = await esAdmin(correo);

  if (req.session.user.correo) {
    if (isAdmin) {
      const query = 'SELECT * FROM Bancos WHERE Nombre = ? AND Interes = ? AND Anios = ? AND Enganche = ?';
      connection.query(query, [nombre, interes, anios, enganche], (err, results) => {
        if (err) {
          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }

        if (results.length > 0) {
          return res.status(201).json({ mensaje: 'El banco con las especificaciones ya existe', error: { Error: true } });
        }

        const query = 'INSERT INTO Bancos (Nombre, Interes, Anios, Enganche) VALUES (?, ?, ?, ?)';
        connection.query(query, [nombre, interes, anios, enganche], (err, results) => {
          if (err) {
            return res.status(201).json({ mensaje: 'Error al crear el Banco', error: { Error: true, error: err } });
          }

          return res.status(201).json({
            mensaje: 'Banco creado exitosamente',
            data: { nombre, interes, anios, enganche },
          });
        });
      });
    } else {
      return res.status(201).json({ mensaje: 'No es admin', error: { Error: true } });
    }
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/onEliminarBanco', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { idBanco, correo } = req.body;
  const isAdmin = await esAdmin(correo);

  if (req.session.user.correo) {
    if (isAdmin) {
      const query = 'DELETE FROM Bancos WHERE ID = ?';
      connection.query(query, [idBanco], (err, results) => {
        if (err) {
          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true, error: err } });
        }

        return res.status(201).json({
          mensaje: 'Banco eliminado exitosamente',
          data: { ok: true },
        });
      });
    } else {
      return res.status(201).json({ mensaje: 'No es admin', error: { Error: true } });
    }
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/onModificarBancos', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { bancos, correo } = req.body;
  const isAdmin = await esAdmin(correo);
  let flag = true
  if (req.session.user.correo) {
    if (isAdmin) {
      for (elemento of bancos) {
        const query = 'UPDATE Bancos SET Nombre = ?, Interes = ?, Anios = ?, Enganche = ? WHERE ID = ?';
        connection.query(query, [elemento.nombre, elemento.interes, elemento.anios, elemento.enganche, elemento.id], (err, results) => {
          if (err) {
            flag = false
          }
        });

        if (flag === false) {

          return res.status(201).json({ mensaje: 'Error de base de datos', error: { Error: true } });

        } else {
          return res.status(201).json({
            mensaje: 'Bancos actualizados exitosamente',
            data: { ok: true },
          });
        }
      }
    } else {
      return res.status(201).json({ mensaje: 'No es admin', error: { Error: true } });
    }
  } else {
    return res.status(201).json({ mensaje: 'No session', error: { Error: true } });
  }
});

router.post('/onEliminarCliente', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { rfc, correo } = req.body;
  const isAdmin = await esAdmin(correo);

  if (req.session.user.correo) {
    if (isAdmin) {
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
      return res.status(201).json({ mensaje: 'No es admin', error: { Error: true } });
    }
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
