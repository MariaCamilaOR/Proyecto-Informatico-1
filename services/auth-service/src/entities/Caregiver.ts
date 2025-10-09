import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Patient } from './Patient';

@Entity('caregivers')
export class Caregiver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User;

  @Column()
  relationship: string; // Relación con el paciente (hijo, esposo, etc.)

  @Column({ type: 'simple-array', default: '' })
  patients: string[]; // Array de IDs de pacientes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Patient, patient => patient.caregiver)
  patientEntities: Patient[];
}
