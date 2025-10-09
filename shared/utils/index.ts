// Utilidades compartidas para el sistema DoYouRemember

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRole, ApiResponse, ErrorResponse } from '../types';

export class EncryptionUtils {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32;
  private static readonly ivLength = 16;
  private static readonly tagLength = 16;

  static encrypt(text: string, key: string): string {
    const keyBuffer = crypto.scryptSync(key, 'salt', this.keyLength);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, keyBuffer);
    cipher.setAAD(Buffer.from('doyouremember', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedText: string, key: string): string {
    const keyBuffer = crypto.scryptSync(key, 'salt', this.keyLength);
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(this.algorithm, keyBuffer);
    decipher.setAAD(Buffer.from('doyouremember', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }
}

export class JWTUtils {
  static generateTokens(payload: any, secret: string, expiresIn: string = '24h'): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = jwt.sign(payload, secret, { expiresIn });
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' }, 
      secret, 
      { expiresIn: '7d' }
    );
    
    const decoded = jwt.decode(accessToken) as any;
    const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds
    };
  }

  static verifyToken(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

export class PasswordUtils {
  static async hashPassword(password: string, rounds: number = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }

  static validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }
}

export class ResponseUtils {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message })
    };
  }

  static error(code: string, message: string, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      }
    };
  }

  static createErrorResponse(
    code: string,
    message: string,
    path: string,
    method: string,
    details?: any
  ): ErrorResponse {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      path,
      method
    };
  }
}

export class DateUtils {
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  static isExpired(date: Date): boolean {
    return date < new Date();
  }

  static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export class RoleUtils {
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.PATIENT]: 1,
      [UserRole.CAREGIVER]: 2,
      [UserRole.DOCTOR]: 3,
      [UserRole.ADMIN]: 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  static canAccessPatientData(userRole: UserRole, patientId: string, userPatients?: string[]): boolean {
    switch (userRole) {
      case UserRole.ADMIN:
        return true;
      case UserRole.DOCTOR:
        return userPatients?.includes(patientId) || false;
      case UserRole.CAREGIVER:
        return userPatients?.includes(patientId) || false;
      case UserRole.PATIENT:
        return userPatients?.includes(patientId) || false;
      default:
        return false;
    }
  }
}

export class FileUtils {
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  static isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export class MetricsUtils {
  static calculateMemoryRecall(description: string, reference: string): number {
    // Implementación simplificada - en producción usar NLP más avanzado
    const descriptionWords = description.toLowerCase().split(/\s+/);
    const referenceWords = reference.toLowerCase().split(/\s+/);
    
    const commonWords = descriptionWords.filter(word => 
      referenceWords.includes(word) && word.length > 3
    );
    
    return Math.round((commonWords.length / referenceWords.length) * 100);
  }

  static calculateNarrativeCoherence(description: string): number {
    // Implementación simplificada - en producción usar NLP más avanzado
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    // Puntuación basada en longitud promedio de oraciones y conectores
    const avgSentenceLength = description.length / sentences.length;
    const connectors = ['y', 'pero', 'entonces', 'porque', 'cuando', 'donde', 'que'];
    const connectorCount = connectors.reduce((count, connector) => 
      count + (description.toLowerCase().split(connector).length - 1), 0
    );
    
    let score = 0;
    if (avgSentenceLength > 20 && avgSentenceLength < 100) score += 40;
    if (connectorCount > 0) score += 30;
    if (sentences.length > 1) score += 30;
    
    return Math.min(score, 100);
  }

  static detectSignificantDeviation(current: number, baseline: number, threshold: number = 20): boolean {
    const deviation = Math.abs(current - baseline);
    return deviation >= threshold;
  }
}

export class Logger {
  private static instance: Logger;
  private context: string;

  constructor(context: string = 'DoYouRemember') {
    this.context = context;
  }

  static getInstance(context?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  info(message: string, meta?: any): void {
    console.log(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`, meta || '');
  }

  error(message: string, error?: Error, meta?: any): void {
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`, error || '', meta || '');
  }

  warn(message: string, meta?: any): void {
    console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`, meta || '');
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`, meta || '');
    }
  }
}
