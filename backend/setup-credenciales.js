// Guarda como setup-credenciales.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setupCredentials() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'mparrae',
      database: 'transmilenio'
    });

    // Obtener todas las personas
    const [personas] = await connection.execute('SELECT per_cedula FROM Persona');

    for (const persona of personas) {
      const cedula = persona.per_cedula;

      // Usar la cédula como contraseña inicial (solo para demostración)
      const passwordHash = await bcrypt.hash(cedula, 10);

      // Verificar si ya tiene credenciales
      const [credencialRows] = await connection.execute(
        'SELECT id FROM credenciales WHERE per_cedula = ?',
        [cedula]
      );

      if (credencialRows.length === 0) {
        // Crear credenciales
        await connection.execute(
          'INSERT INTO credenciales (per_cedula, password_hash) VALUES (?, ?)',
          [cedula, passwordHash]
        );
        console.log(`Credenciales creadas para: ${cedula}`);
      } else {
        console.log(`Las credenciales ya existen para: ${cedula}`);
      }
    }

    console.log('Configuración completada');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupCredentials();