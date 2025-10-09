import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Caregiver } from './Caregiver';
import { Doctor } from './Doctor';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ unique: true })
  medicalRecordNumber: string;

  @Column({ nullable: true })
  caregiverId?: string;

  @Column({ nullable: true })
  doctorId?: string;

  @Column({ default: false })
  baselineEstablished: boolean;

  @Column({ type: 'jsonb', nullable: true })
  cognitiveBaseline?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Caregiver, caregiver => caregiver.patients)
  @JoinColumn({ name: 'caregiverId' })
  caregiver?: Caregiver;

  @ManyToOne(() => Doctor, doctor => doctor.patients)
  @JoinColumn({ name: 'doctorId' })
  doctor?: Doctor;
}
