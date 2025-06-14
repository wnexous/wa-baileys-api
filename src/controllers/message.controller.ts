import { Request, Response } from 'express';
import { prisma } from '../index';
import { 
  sendTextMessage as sendTextMessageService, 
  sendMediaMessage as sendMediaMessageService,
  sendButtonMessage as sendButtonMessageService,
  updateChatPresence as updateChatPresenceService,
  reactToMessage as reactToMessageService,
  deleteMessage as deleteMessageService,
  editMessage as editMessageService
} from '../services/whatsapp';

/**
 * Send a text message
 */
export const sendTextMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, text, options } = req.body;

    if (!sessionId || !jid || !text) {
      return res.status(400).json({ 
        error: 'Missing required parameters: sessionId, jid, text' 
      });
    }

    // Check if session exists
    const session = await prisma.whatsAppSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Send message
    const message = await sendTextMessageService(sessionId, jid, text, options);
    
    return res.status(200).json({ 
      message: 'Message sent successfully',
      data: message ? {
        id: message.key.id,
        timestamp: message.messageTimestamp
      } : null
    });
  } catch (error: any) {
    console.error('Error sending text message:', error);
    return res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message
    });
  }
};

/**
 * Send a media message
 */
export const sendMediaMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, media, caption, options } = req.body;

    if (!sessionId || !jid || !media) {
      return res.status(400).json({ 
        error: 'Missing required parameters: sessionId, jid, media' 
      });
    }

    // Check if session exists
    const session = await prisma.whatsAppSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Send message
    const message = await sendMediaMessageService(sessionId, jid, media, caption, options);
    
    return res.status(200).json({ 
      message: 'Media message sent successfully',
      data: message ? {
        id: message.key.id,
        timestamp: message.messageTimestamp
      } : null
    });
  } catch (error: any) {
    console.error('Error sending media message:', error);
    return res.status(500).json({ 
      error: 'Failed to send media message',
      message: error.message
    });
  }
};

/**
 * Get messages for a specific session and JID
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, limit = 20, offset = 0 } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Build query
    const query: any = {
      where: {
        sessionId: sessionId as string
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Number(limit),
      skip: Number(offset)
    };

    // Add JID filter if provided
    if (jid) {
      query.where.jid = jid as string;
    }

    // Get messages
    const messages = await prisma.message.findMany(query);
    const total = await prisma.message.count({ where: query.where });
    
    return res.status(200).json({ 
      messages: messages.map(msg => ({
        ...msg,
        content: JSON.parse(msg.content)
      })),
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
};

/**
 * Get a message by ID
 */
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { messageId }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.status(200).json({ 
      message: {
        ...message,
        content: JSON.parse(message.content)
      }
    });
  } catch (error) {
    console.error('Error getting message:', error);
    return res.status(500).json({ error: 'Failed to get message' });
  }
};

/**
 * Send a button message
 */
export const sendButtonMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, text, footer, buttons, options } = req.body;

    if (!sessionId || !jid || !text || !footer || !buttons) {
      return res.status(400).json({ 
        error: 'Missing required parameters: sessionId, jid, text, footer, buttons' 
      });
    }

    if (!Array.isArray(buttons) || buttons.some(btn => !btn.id || !btn.displayText)) {
      return res.status(400).json({
        error: 'Invalid buttons format. Each button must have an id and displayText.'
      });
    }

    // Check if session exists
    const session = await prisma.whatsAppSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Send message
    const message = await sendButtonMessageService(sessionId, jid, text, footer, buttons, options);
    
    return res.status(200).json({ 
      message: 'Button message sent successfully',
      data: message ? {
        id: message.key.id,
        timestamp: message.messageTimestamp
      } : null
    });
  } catch (error: any) {
    console.error('Error sending button message:', error);
    return res.status(500).json({ 
      error: 'Failed to send button message',
      message: error.message
    });
  }
};

/**
 * Update chat presence (e.g., composing, paused)
 */
export const updateChatPresence = async (req: Request, res: Response) => {
  const { sessionId, jid, presence } = req.body;

  if (!sessionId || !jid || !presence) {
    return res.status(400).json({ error: 'Missing required parameters: sessionId, jid, presence' });
  }

  const validPresences: string[] = ['composing', 'paused', 'recording', 'available', 'unavailable'];
  if (!validPresences.includes(presence)) {
    return res.status(400).json({ error: `Invalid presence value. Must be one of: ${validPresences.join(', ')}` });
  }

  try {
    // Check if session exists
    const session = await prisma.whatsAppSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = await updateChatPresenceService(sessionId, jid, presence as any);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error updating chat presence:', error);
    res.status(500).json({ error: error.message || 'Failed to update chat presence' });
  }
};

/**
 * React to a message
 */
export const reactToMessage = async (req: Request, res: Response) => {
  const { sessionId, key, reaction, options } = req.body;
  if (!sessionId || !key || !reaction) {
    return res.status(400).json({ error: 'Missing required parameters: sessionId, key, reaction' });
  }
  try {
    const session = await prisma.whatsAppSession.findUnique({ where: { sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const result = await reactToMessageService(sessionId, key, reaction, options);
    res.status(200).json({ message: 'Reaction sent', data: result });
  } catch (error: any) {
    console.error('Error reacting to message:', error);
    res.status(500).json({ error: error.message || 'Failed to react to message' });
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (req: Request, res: Response) => {
  const { sessionId, key, options } = req.body;
  if (!sessionId || !key) {
    return res.status(400).json({ error: 'Missing required parameters: sessionId, key' });
  }
  try {
    const session = await prisma.whatsAppSession.findUnique({ where: { sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const result = await deleteMessageService(sessionId, key, options);
    res.status(200).json({ message: 'Message deleted', data: result });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message || 'Failed to delete message' });
  }
};

/**
 * Edit a message
 */
export const editMessage = async (req: Request, res: Response) => {
  const { sessionId, key, text, options } = req.body;
  if (!sessionId || !key || !text) {
    return res.status(400).json({ error: 'Missing required parameters: sessionId, key, text' });
  }
  try {
    const session = await prisma.whatsAppSession.findUnique({ where: { sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const result = await editMessageService(sessionId, key, text, options);
    res.status(200).json({ message: 'Message edited', data: result });
  } catch (error: any) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: error.message || 'Failed to edit message' });
  }
};
