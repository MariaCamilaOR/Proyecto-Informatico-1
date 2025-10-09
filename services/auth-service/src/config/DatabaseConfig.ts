import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Caregiver } from '../entities/Caregiver';
import { Doctor } from '../entities/Doctor';
import { Invitation } from '../entities/Invitation';
import { RefreshToken } from '../entities/RefreshToken';

export const DatabaseConfig = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Patient, Caregiver, Doctor, Invitation, RefreshToken],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  migrationsRun: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
