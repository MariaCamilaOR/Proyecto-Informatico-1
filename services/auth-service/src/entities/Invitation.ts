import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { InvitationStatus } from '@shared/types';
import { User } from './User';

@Entity('invitations')
@Index(['code'], { unique: true })
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  caregiverId: string;

  @Column({ nullable: true })
  patientId?: string;

  @Column({ nullable: true })
  patientEmail?: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING
  })
  status: InvitationStatus;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'caregiverId' })
  caregiver: User;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'patientId' })
  patient?: User;

  // Métodos de utilidad
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canBeAccepted(): boolean {
    return this.status === InvitationStatus.PENDING && !this.isExpired();
  }
}
