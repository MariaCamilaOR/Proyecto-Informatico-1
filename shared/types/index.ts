// Tipos compartidos para el sistema DoYouRemember

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  twoFactorEnabled: boolean;
  profilePicture?: string;
}

export enum UserRole {
  PATIENT = 'patient',
  CAREGIVER = 'caregiver',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

export interface Patient extends User {
  role: UserRole.PATIENT;
  dateOfBirth: Date;
  medicalRecordNumber: string;
  caregiverId?: string;
  doctorId?: string;
  baselineEstablished: boolean;
  cognitiveBaseline?: CognitiveBaseline;
}

export interface Caregiver extends User {
  role: UserRole.CAREGIVER;
  patients: string[]; // Array de IDs de pacientes
  relationship: string; // Relación con el paciente
}

export interface Doctor extends User {
  role: UserRole.DOCTOR;
  licenseNumber: string;
  specialization: string;
  patients: string[]; // Array de IDs de pacientes
}

export interface Photo {
  id: string;
  patientId: string;
  uploadedBy: string; // ID del cuidador que subió la foto
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: PhotoTag[];
  isBaseline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoTag {
  id: string;
  photoId: string;
  type: TagType;
  label: string;
  x: number; // Posición X en la imagen (0-1)
  y: number; // Posición Y en la imagen (0-1)
  width: number; // Ancho relativo (0-1)
  height: number; // Alto relativo (0-1)
}

export enum TagType {
  PERSON = 'person',
  OBJECT = 'object',
  PLACE = 'place',
  EVENT = 'event'
}

export interface PhotoDescription {
  id: string;
  photoId: string;
  patientId: string;
  description: string;
  audioUrl?: string;
  transcription?: string;
  isBaseline: boolean;
  createdAt: Date;
  sessionId: string;
}

export interface CognitiveSession {
  id: string;
  patientId: string;
  type: SessionType;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
  photos: string[]; // Array de IDs de fotos
  descriptions: string[]; // Array de IDs de descripciones
  metrics?: CognitiveMetrics;
}

export enum SessionType {
  BASELINE = 'baseline',
  ASSESSMENT = 'assessment',
  FOLLOW_UP = 'follow_up'
}

export enum SessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface CognitiveMetrics {
  id: string;
  sessionId: string;
  patientId: string;
  memoryRecall: number; // 0-100
  narrativeCoherence: number; // 0-100
  detailAccuracy: number; // 0-100
  emotionalRecognition: number; // 0-100
  temporalAccuracy: number; // 0-100
  calculatedAt: Date;
}

export interface CognitiveBaseline {
  id: string;
  patientId: string;
  establishedAt: Date;
  metrics: CognitiveMetrics;
  photos: string[]; // IDs de fotos usadas para establecer la línea base
  isValid: boolean;
  recalibratedAt?: Date;
  recalibrationReason?: string;
}

export interface Report {
  id: string;
  patientId: string;
  generatedBy: string; // ID del médico
  type: ReportType;
  title: string;
  content: string;
  metrics: CognitiveMetrics[];
  baselineComparison?: BaselineComparison;
  recommendations: string[];
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export enum ReportType {
  BASELINE = 'baseline',
  PROGRESS = 'progress',
  COMPREHENSIVE = 'comprehensive',
  ALERT = 'alert'
}

export interface BaselineComparison {
  currentMetrics: CognitiveMetrics;
  baselineMetrics: CognitiveMetrics;
  deviations: {
    memoryRecall: number;
    narrativeCoherence: number;
    detailAccuracy: number;
    emotionalRecognition: number;
    temporalAccuracy: number;
  };
  significantDeviations: string[];
}

export interface Alert {
  id: string;
  patientId: string;
  doctorId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metrics: {
    metric: string;
    currentValue: number;
    baselineValue: number;
    deviation: number;
    threshold: number;
  }[];
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export enum AlertType {
  COGNITIVE_DECLINE = 'cognitive_decline',
  SIGNIFICANT_DEVIATION = 'significant_deviation',
  MISSED_SESSION = 'missed_session',
  SYSTEM_ERROR = 'system_error'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

export enum NotificationType {
  REMINDER = 'reminder',
  ALERT = 'alert',
  SYSTEM = 'system',
  INVITATION = 'invitation'
}

export interface Invitation {
  id: string;
  code: string;
  caregiverId: string;
  patientId?: string;
  patientEmail?: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  startDate?: Date;
  endDate?: Date;
  patientId?: string;
  doctorId?: string;
  caregiverId?: string;
  status?: string;
  type?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dateOfBirth?: Date;
  medicalRecordNumber?: string;
  licenseNumber?: string;
  specialization?: string;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ServiceConfig {
  name: string;
  port: number;
  host: string;
  url: string;
  healthCheck: string;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  path: string;
  method: string;
}

// Eventos del Message Broker
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  version: string;
}

export interface PhotoUploadedEvent extends BaseEvent {
  type: 'photo.uploaded';
  data: {
    photoId: string;
    patientId: string;
    uploadedBy: string;
    filename: string;
  };
}

export interface PhotoDescriptionCreatedEvent extends BaseEvent {
  type: 'photo.description.created';
  data: {
    descriptionId: string;
    photoId: string;
    patientId: string;
    sessionId: string;
    hasAudio: boolean;
  };
}

export interface SessionCompletedEvent extends BaseEvent {
  type: 'session.completed';
  data: {
    sessionId: string;
    patientId: string;
    type: SessionType;
    metrics: CognitiveMetrics;
  };
}

export interface AlertTriggeredEvent extends BaseEvent {
  type: 'alert.triggered';
  data: {
    alertId: string;
    patientId: string;
    doctorId: string;
    type: AlertType;
    severity: AlertSeverity;
  };
}

export type SystemEvent = 
  | PhotoUploadedEvent 
  | PhotoDescriptionCreatedEvent 
  | SessionCompletedEvent 
  | AlertTriggeredEvent;
