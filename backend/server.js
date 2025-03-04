const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
/**
 * A simple Express middleware for logging HTTP requests
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeBody - Whether to log request body (default: false)
 * @param {boolean} options.includeHeaders - Whether to log request headers (default: false)
 * @param {Function} options.logger - Custom logger function (default: console.log)
 * @returns {Function} Express middleware function
 */
const requestLogger = (options = {}) => {
  const {
    includeBody = false,
    includeHeaders = false,
    logger = console.log
  } = options;

  return (req, res, next) => {
    // Capture timestamp when request started
    const startTime = new Date();

    // Store original end method to wrap it
    const originalEnd = res.end;

    // Create a log entry with basic info
    const logEntry = {
      timestamp: startTime.toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
    };

    // Add headers if requested
    if (includeHeaders) {
      logEntry.headers = req.headers;
    }

    // Add body if requested (and if it exists)
    if (includeBody && req.body) {
      logEntry.body = req.body;
    }

    // Override end method to capture response data
    res.end = function (chunk, encoding) {
      // Calculate request duration
      const endTime = new Date();
      const duration = endTime - startTime;

      // Add response info to log entry
      logEntry.statusCode = res.statusCode;
      logEntry.duration = `${duration}ms`;

      // Log the entry
      logger(`[REQUEST] ${logEntry.method} ${logEntry.url} ${logEntry.statusCode} ${logEntry.duration}`);

      if (includeHeaders || includeBody) {
        logger(JSON.stringify(logEntry, null, 2));
      }

      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };

    // Continue to next middleware
    next();
  };
};

app.use(requestLogger({ includeBody: true }));
// Crear un pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
  queueLimit: Number(process.env.DB_QUEUE_LIMIT)
});

app.post('/login', (req, res) => {
  const { cedula, password } = req.body;

  // Buscar la contraseña en la tabla credenciales
  pool.query('SELECT * FROM credenciales WHERE per_cedula = ?', [cedula], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const userCreds = results[0];

    bcrypt.compare(password, userCreds.password_hash, (err, match) => {
      if (err) return res.status(500).json({ message: 'Error en la verificación' });
      if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

      // Consultar los datos del usuario en Persona
      pool.query('SELECT * FROM Persona WHERE per_cedula = ?', [cedula], (err, userResults) => {
        if (err) {
          console.error('Error en la consulta:', err);
          return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (userResults.length === 0) {
          return res.status(500).json({ message: 'Error en los datos del usuario' });
        }

        const user = userResults[0];
        res.status(200).json({ message: 'Login exitoso', user });
      });
    });
  });
});


// Endpoint para obtener todas las rutas
app.get('/rutas', (req, res) => {
  pool.query('SELECT * FROM Ruta', (err, results) => {
    if (err) {
      console.error('Error en la consulta de rutas:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    res.status(200).json(results);
  });
});

app.get('/api/tarjeta/:cedula', (req, res) => {
  const { cedula } = req.params;

  pool.query(
    `SELECT t.tar_id AS id_tarjeta, t.tar_saldo AS saldo 
     FROM Tarjeta t 
     JOIN Usuario u ON t.tar_id = u.tar_id 
     WHERE u.per_cedula = ?`,
    [cedula],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta de tarjeta:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Tarjeta no encontrada' });
      }

      res.status(200).json(results[0]);
    }
  );
});

// Endpoint para obtener las recargas de una tarjeta específica
app.get('/api/recargas/:tarjetaId', (req, res) => {
  const { tarjetaId } = req.params;
  pool.query(
    `SELECT rec_id, rec_fecha, rec_valor, prov_banco
     FROM Recarga NATURAL JOIN Online_recarga NATURAL JOIN Proveedor_recarga
     WHERE tar_id = ? 
     ORDER BY rec_fecha DESC`,
    [tarjetaId],
    (err, results) => {
      console.log(err, results);
      if (err) {
        console.error('Error obteniendo recargas:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No hay recargas registradas' });
      }
      console.log(results);

      res.status(200).json(results);
    }
  );
});
// Endpoint para obtener información del usuario por cédula
app.get('/api/user/:cedula', (req, res) => {
  const { cedula } = req.params;

  pool.query(
    'SELECT per_nombre AS nombre, per_apellido AS apellido FROM Persona WHERE per_cedula = ?',
    [cedula],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta de usuario:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Combinar nombre y apellido
      const userData = {
        nombre: `${results[0].nombre} ${results[0].apellido || ''}`.trim()
      };

      res.status(200).json(userData);
    }
  );
});

// Endpoint para obtener todas las estaciones
app.get('/estaciones', (req, res) => {
  pool.query('SELECT * FROM Estacion', (err, results) => {
    if (err) {
      console.error('Error en la consulta de estaciones:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    res.status(200).json(results);
  });
});

// Endpoint para obtener todos los horarios
app.get('/horarios', (req, res) => {
  pool.query(
    `SELECT r.rut_id, r.rut_nombre, r.rut_horario_inicial, r.rut_horario_final 
     FROM Ruta r 
     ORDER BY r.rut_nombre`,
    (err, results) => {
      if (err) {
        console.error('Error en la consulta de horarios:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      res.status(200).json(results);
    }
  );
});

// Endpoint para buscar rutas por nombre o destino
app.get('/rutas/buscar', (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Término de búsqueda no proporcionado' });
  }

  // Búsqueda por nombre de ruta o destino
  pool.query(
    `SELECT * FROM Ruta 
     WHERE rut_nombre LIKE ? 
     OR rut_id IN (
       SELECT DISTINCT rut_id FROM Parada p 
       JOIN Estacion e ON p.est_id = e.est_id 
       WHERE e.est_nombre LIKE ?
     )`,
    [`%${searchTerm}%`, `%${searchTerm}%`],
    (err, results) => {
      if (err) {
        console.error('Error en la búsqueda de rutas:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      res.status(200).json(results);
    }
  );
});


// Endpoint específico para recargas online
app.post('/api/online-recharge', (req, res) => {
  console.log("Recibiendo solicitud de recarga online:", req.body);

  const { email, bank, amount, tarId } = req.body;

  // Validación de datos
  if (!email || !bank || !amount || !tarId) {
    console.log("Datos incompletos:", { email, bank, amount, tarId });
    return res.status(400).json({ success: false, message: 'Se requieren todos los datos: email, banco, monto y ID de tarjeta' });
  }

  // Convertir a números
  const tarIdNumerico = parseInt(tarId);
  const montoNumerico = parseFloat(amount);

  // Iniciar una conexión simple
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión:', err);
      return res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
    }

    // 1. Insertar en Recarga
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const insertRecarga = `INSERT INTO Recarga (rec_fecha, rec_valor, tar_id) VALUES (?, ?, ?)`;

    connection.query(insertRecarga, [fechaActual, montoNumerico, tarIdNumerico], (err, recargaResult) => {
      if (err) {
        connection.release();
        console.error('Error al insertar recarga:', err);
        return res.status(500).json({ success: false, message: 'Error al insertar recarga' });
      }

      const recargaId = recargaResult.insertId;
      console.log("Recarga insertada con ID:", recargaId);

      // 2. Insertar en Online_recarga
      const insertOnline = `INSERT INTO Online_recarga (on_correo, rec_id) VALUES (?, ?)`;
      connection.query(insertOnline, [email, recargaId], (err, onlineResult) => {
        if (err) {
          connection.release();
          console.error('Error al insertar recarga online:', err);
          return res.status(500).json({ success: false, message: 'Error al insertar recarga online' });
        }

        const onlineId = onlineResult.insertId;
        console.log("Online_recarga insertada con ID:", onlineId);

        // 3. Insertar en Proveedor_recarga
        const insertProveedor = `INSERT INTO Proveedor_recarga (prov_banco, on_id) VALUES (?, ?)`;
        connection.query(insertProveedor, [bank, onlineId], (err) => {
          if (err) {
            connection.release();
            console.error('Error al insertar proveedor:', err);
            return res.status(500).json({ success: false, message: 'Error al insertar proveedor' });
          }

          console.log("Proveedor_recarga insertado correctamente");

          // 4. Actualizar saldo
          const updateSaldo = `UPDATE Tarjeta SET tar_saldo = tar_saldo + ? WHERE tar_id = ?`;
          connection.query(updateSaldo, [montoNumerico, tarIdNumerico], (err, updateResult) => {
            connection.release(); // Liberar la conexión

            if (err) {
              console.error('Error al actualizar saldo:', err);
              return res.status(500).json({ success: false, message: 'Error al actualizar saldo' });
            }

            console.log("Saldo actualizado correctamente");
            return res.status(200).json({
              success: true,
              message: 'Recarga realizada con éxito',
              recargaId
            });
          });
        });
      });
    });
  });
});

// Endpoint para obtener información de tarjeta por ID
app.get('/api/tarjeta/id/:tarjetaId', (req, res) => {
  const { tarjetaId } = req.params;

  pool.query(
    `SELECT tar_id AS id_tarjeta, tar_saldo AS saldo, , tar_tipo AS tipo, tar_estado AS estado
     FROM Tarjeta 
     WHERE tar_id = ?`,
    [tarjetaId],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta de tarjeta:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Tarjeta no encontrada' });
      }

      res.status(200).json(results[0]);
    }
  );
});

// Endpoint para obtener el valor del pasaje según el tipo de usuario
app.get('/api/tarifas/pasaje/:tipoUsuario', (req, res) => {
  const { tipoUsuario } = req.params;

  let tipoPasajeId = 1; // Por defecto es pasaje normal

  // Determinar el tipo de pasaje según el tipo de usuario
  switch (tipoUsuario.toLowerCase()) {
    case 'estudiante':
      tipoPasajeId = 4; // ID para tarifa de estudiante
      break;
    case 'adulto mayor':
      tipoPasajeId = 5; // ID para tarifa de adulto mayor
      break;
    case 'discapacidad':
      tipoPasajeId = 3; // ID para tarifa de discapacidad
      break;
    default:
      tipoPasajeId = 1; // Tarifa normal para usuarios regulares
  }

  pool.query(
    `SELECT tip_pas_id, tip_pas_valor 
     FROM Tipo_pasaje 
     WHERE tip_pas_id = ?`,
    [tipoPasajeId],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta de tarifa:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (results.length === 0) {
        // Si no se encuentra la tarifa específica, devolvemos la tarifa normal
        pool.query(
          `SELECT tip_pas_id, tip_pas_valor 
           FROM Tipo_pasaje 
           WHERE tip_pas_id = 1`,
          (err, defaultResults) => {
            if (err || defaultResults.length === 0) {
              return res.status(404).json({ message: 'Tarifa no encontrada' });
            }
            res.status(200).json(defaultResults[0]);
          }
        );
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// Endpoint para obtener el tipo de usuario por cédula
app.get('/api/usuario/tipo/:cedula', (req, res) => {
  const { cedula } = req.params;

  pool.query(
    `SELECT usu_tipo FROM Usuario WHERE per_cedula = ?`,
    [cedula],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta del tipo de usuario:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json(results[0]);
    }
  );
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
