const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://doyouremember:password@localhost:5432/doyouremember'
});

async function rollback() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Obtener la última migración ejecutada
    const lastMigration = await client.query(
      'SELECT filename FROM doyouremember.migrations ORDER BY id DESC LIMIT 1'
    );

    if (lastMigration.rows.length === 0) {
      console.log('No hay migraciones para hacer rollback');
      return;
    }

    const lastMigrationFile = lastMigration.rows[0].filename;
    console.log(`Haciendo rollback de la migración: ${lastMigrationFile}`);

    // Leer archivo de rollback si existe
    const rollbackDir = path.join(__dirname, '..', 'rollbacks');
    const rollbackFile = path.join(rollbackDir, lastMigrationFile);

    if (!fs.existsSync(rollbackFile)) {
      console.log(`No se encontró archivo de rollback para ${lastMigrationFile}`);
      console.log('Creando rollback básico...');
      
      // Rollback básico: eliminar la migración de la tabla
      await client.query('BEGIN');
      try {
        await client.query(
          'DELETE FROM doyouremember.migrations WHERE filename = $1',
          [lastMigrationFile]
        );
        await client.query('COMMIT');
        console.log('✓ Rollback básico completado');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } else {
      // Ejecutar rollback desde archivo
      const rollbackSQL = fs.readFileSync(rollbackFile, 'utf8');
      
      await client.query('BEGIN');
      try {
        await client.query(rollbackSQL);
        await client.query(
          'DELETE FROM doyouremember.migrations WHERE filename = $1',
          [lastMigrationFile]
        );
        await client.query('COMMIT');
        console.log('✓ Rollback ejecutado exitosamente');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

  } catch (error) {
    console.error('Error ejecutando rollback:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

rollback();
