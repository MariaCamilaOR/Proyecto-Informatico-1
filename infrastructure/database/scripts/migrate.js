const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://doyouremember:password@localhost:5432/doyouremember'
});

async function migrate() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Crear tabla de migraciones si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS doyouremember.migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Obtener migraciones ejecutadas
    const executedMigrations = await client.query(
      'SELECT filename FROM doyouremember.migrations ORDER BY id'
    );
    const executedFiles = executedMigrations.rows.map(row => row.filename);

    // Leer archivos de migración
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Encontradas ${migrationFiles.length} migraciones`);

    // Ejecutar migraciones pendientes
    for (const file of migrationFiles) {
      if (!executedFiles.includes(file)) {
        console.log(`Ejecutando migración: ${file}`);
        
        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file), 
          'utf8'
        );

        await client.query('BEGIN');
        try {
          await client.query(migrationSQL);
          await client.query(
            'INSERT INTO doyouremember.migrations (filename) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✓ Migración ${file} ejecutada exitosamente`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else {
        console.log(`- Migración ${file} ya ejecutada`);
      }
    }

    console.log('Todas las migraciones han sido ejecutadas');
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
