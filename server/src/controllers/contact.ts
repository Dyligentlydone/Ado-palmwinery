import { Request, Response } from 'express';
import prisma from '../config/database';

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    const msg = await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, message },
    });

    res.status(201).json({ message: 'Message received', id: msg.id });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const adminGetMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    console.error('Admin get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const adminMarkMessageRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const msg = await prisma.contactMessage.update({
      where: { id: req.params.id as string },
      data: { isRead: req.body.isRead ?? true },
    });
    res.json(msg);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    console.error('Admin mark message error:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

export const adminDeleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    console.error('Admin delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
