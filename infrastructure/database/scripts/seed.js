const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://doyouremember:password@localhost:5432/doyouremember'
});

async function seed() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos para seeding');

    // Verificar si ya hay datos
    const userCount = await client.query('SELECT COUNT(*) FROM doyouremember.users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('La base de datos ya contiene datos. Saltando seeding.');
      return;
    }

    console.log('Iniciando seeding de datos...');

    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await client.query(`
      INSERT INTO doyouremember.users (email, password, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['admin@doyouremember.com', adminPassword, 'Administrador', 'Sistema', 'admin', true]);

    const adminId = adminResult.rows[0].id;
    console.log('✓ Usuario administrador creado');

    // Crear usuario médico de ejemplo
    const doctorPassword = await bcrypt.hash('doctor123', 12);
    const doctorResult = await client.query(`
      INSERT INTO doyouremember.users (email, password, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['doctor@doyouremember.com', doctorPassword, 'Dr. Juan', 'Pérez', 'doctor', true]);

    const doctorId = doctorResult.rows[0].id;

    // Crear perfil de médico
    await client.query(`
      INSERT INTO doyouremember.doctors (user_id, license_number, specialization)
      VALUES ($1, $2, $3)
    `, [doctorId, 'MED123456', 'Neurología']);

    console.log('✓ Usuario médico creado');

    // Crear usuario cuidador de ejemplo
    const caregiverPassword = await bcrypt.hash('caregiver123', 12);
    const caregiverResult = await client.query(`
      INSERT INTO doyouremember.users (email, password, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['cuidador@doyouremember.com', caregiverPassword, 'María', 'González', 'caregiver', true]);

    const caregiverId = caregiverResult.rows[0].id;

    // Crear perfil de cuidador
    await client.query(`
      INSERT INTO doyouremember.caregivers (user_id, relationship)
      VALUES ($1, $2)
    `, [caregiverId, 'Hija']);

    console.log('✓ Usuario cuidador creado');

    // Crear usuario paciente de ejemplo
    const patientPassword = await bcrypt.hash('patient123', 12);
    const patientResult = await client.query(`
      INSERT INTO doyouremember.users (email, password, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['paciente@doyouremember.com', patientPassword, 'Carlos', 'Rodríguez', 'patient', true]);

    const patientId = patientResult.rows[0].id;

    // Crear perfil de paciente
    await client.query(`
      INSERT INTO doyouremember.patients (user_id, date_of_birth, medical_record_number, caregiver_id, doctor_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [patientId, '1950-05-15', 'MRN001', caregiverId, doctorId]);

    console.log('✓ Usuario paciente creado');

    // Actualizar arrays de pacientes en cuidadores y doctores
    await client.query(`
      UPDATE doyouremember.caregivers 
      SET patients = ARRAY[$1] 
      WHERE user_id = $2
    `, [patientId, caregiverId]);

    await client.query(`
      UPDATE doyouremember.doctors 
      SET patients = ARRAY[$1] 
      WHERE user_id = $2
    `, [patientId, doctorId]);

    // Crear algunas notificaciones de ejemplo
    await client.query(`
      INSERT INTO doyouremember.notifications (user_id, type, title, message)
      VALUES 
        ($1, 'system', 'Bienvenido a DoYouRemember', 'Su cuenta ha sido creada exitosamente. Comience subiendo algunas fotos familiares.'),
        ($2, 'reminder', 'Recordatorio de actividad', 'Es hora de realizar una actividad de evaluación cognitiva.'),
        ($3, 'alert', 'Nuevo reporte disponible', 'Se ha generado un nuevo reporte de progreso para su paciente.')
    `, [patientId, patientId, caregiverId]);

    console.log('✓ Notificaciones de ejemplo creadas');

    console.log('\n🎉 Seeding completado exitosamente!');
    console.log('\nUsuarios creados:');
    console.log('👤 Admin: admin@doyouremember.com / admin123');
    console.log('👨‍⚕️ Doctor: doctor@doyouremember.com / doctor123');
    console.log('👩‍👧 Cuidador: cuidador@doyouremember.com / caregiver123');
    console.log('👴 Paciente: paciente@doyouremember.com / patient123');

  } catch (error) {
    console.error('Error durante el seeding:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
