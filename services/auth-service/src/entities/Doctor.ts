import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Patient } from './Patient';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  licenseNumber: string;

  @Column()
  specialization: string;

  @Column({ type: 'simple-array', default: '' })
  patients: string[]; // Array de IDs de pacientes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Patient, patient => patient.doctor)
  patientEntities: Patient[];
}
