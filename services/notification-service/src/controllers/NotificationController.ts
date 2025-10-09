import { Request, Response } from 'express';
import { ResponseUtils, Logger } from '@shared/utils';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  private logger = Logger.getInstance('NotificationController');

  constructor(private notificationService: NotificationService) {}

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, title, message, data, scheduledFor } = req.body;

      if (!userId || !type || !title || !message) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Campos requeridos: userId, type, title, message'));
        return;
      }

      const notification = await this.notificationService.createNotification({
        userId,
        type,
        title,
        message,
        data,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      });

      this.logger.info('Notificación creada', { notificationId: notification.id, userId });

      res.status(201).json(ResponseUtils.success({ notification }));
    } catch (error) {
      this.logger.error('Error al crear notificación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, type, isRead } = req.query;

      const notifications = await this.notificationService.getNotifications({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        isRead: isRead ? isRead === 'true' : undefined
      });

      res.json(ResponseUtils.success({ notifications }));
    } catch (error) {
      this.logger.error('Error al obtener notificaciones', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async getNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const notification = await this.notificationService.getNotification(id);

      if (!notification) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Notificación no encontrada'));
        return;
      }

      res.json(ResponseUtils.success({ notification }));
    } catch (error) {
      this.logger.error('Error al obtener notificación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.notificationService.markAsRead(id);

      res.json(ResponseUtils.success({ message: 'Notificación marcada como leída' }));
    } catch (error) {
      this.logger.error('Error al marcar notificación como leída', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.notificationService.deleteNotification(id);

      res.json(ResponseUtils.success({ message: 'Notificación eliminada' }));
    } catch (error) {
      this.logger.error('Error al eliminar notificación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.body;

      if (!notificationId) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'ID de notificación requerido'));
        return;
      }

      await this.notificationService.sendNotification(notificationId);

      res.json(ResponseUtils.success({ message: 'Notificación enviada' }));
    } catch (error) {
      this.logger.error('Error al enviar notificación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, isRead } = req.query;

      const notifications = await this.notificationService.getUserNotifications(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        isRead: isRead ? isRead === 'true' : undefined
      });

      res.json(ResponseUtils.success({ notifications }));
    } catch (error) {
      this.logger.error('Error al obtener notificaciones del usuario', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }
}
