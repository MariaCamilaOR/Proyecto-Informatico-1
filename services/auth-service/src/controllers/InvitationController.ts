import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Invitation } from '../entities/Invitation';
import { User } from '../entities/User';
import { ResponseUtils, Logger } from '@shared/utils';
import { v4 as uuidv4 } from 'uuid';

export class InvitationController {
  private logger = Logger.getInstance('InvitationController');

  async createInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { patientEmail, patientId } = req.body;
      const caregiverId = req.user!.id;

      if (!patientEmail && !patientId) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Email del paciente o ID es requerido'));
        return;
      }

      const invitationRepository = getRepository(Invitation);
      const code = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      const invitation = invitationRepository.create({
        code,
        caregiverId,
        patientId,
        patientEmail,
        expiresAt
      });

      const savedInvitation = await invitationRepository.save(invitation);

      res.status(201).json(ResponseUtils.success({ 
        invitation: savedInvitation,
        message: 'Invitación creada exitosamente'
      }));
    } catch (error) {
      this.logger.error('Error al crear invitación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async getInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const invitationRepository = getRepository(Invitation);
      const invitation = await invitationRepository.findOne({
        where: { code },
        relations: ['caregiver']
      });

      if (!invitation) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Invitación no encontrada'));
        return;
      }

      if (invitation.isExpired()) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Invitación expirada'));
        return;
      }

      res.json(ResponseUtils.success({ invitation }));
    } catch (error) {
      this.logger.error('Error al obtener invitación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const invitationRepository = getRepository(Invitation);
      const invitation = await invitationRepository.findOne({
        where: { code }
      });

      if (!invitation) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Invitación no encontrada'));
        return;
      }

      if (!invitation.canBeAccepted()) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Invitación no puede ser aceptada'));
        return;
      }

      invitation.status = 'accepted' as any;
      invitation.acceptedAt = new Date();
      await invitationRepository.save(invitation);

      res.json(ResponseUtils.success({ message: 'Invitación aceptada exitosamente' }));
    } catch (error) {
      this.logger.error('Error al aceptar invitación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async rejectInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const invitationRepository = getRepository(Invitation);
      const invitation = await invitationRepository.findOne({
        where: { code }
      });

      if (!invitation) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Invitación no encontrada'));
        return;
      }

      invitation.status = 'rejected' as any;
      await invitationRepository.save(invitation);

      res.json(ResponseUtils.success({ message: 'Invitación rechazada' }));
    } catch (error) {
      this.logger.error('Error al rechazar invitación', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async getUserInvitations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const invitationRepository = getRepository(Invitation);
      const invitations = await invitationRepository.find({
        where: { caregiverId: userId },
        order: { createdAt: 'DESC' }
      });

      res.json(ResponseUtils.success({ invitations }));
    } catch (error) {
      this.logger.error('Error al obtener invitaciones del usuario', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }
}
