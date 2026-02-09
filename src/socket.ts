import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './config/index.js';
import dmService from './services/dm.service.js';
import { User } from './db/models/index.js';

/**
 * WebSocket Server for Direct Messages
 * 
 * Handles real-time messaging, typing indicators, and DM notifications
 */

// Store active socket connections: userId -> socketId
const activeConnections = new Map<string, Set<string>>();
let ioInstance: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Allow all origins in development
      credentials: true
    }
  });

  ioInstance = io;

  /**
   * Middleware: Authenticate socket connection
   */
  io.use(async (socket: any, next: any) => {
    try {
      const token = socket.handshake.auth.token as string;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // Verify user still exists and is active
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      // Attach user to socket
      socket.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      };

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  /**
   * Connection handler
   */
  io.on('connection', (socket: any) => {
    const userId = socket.user.id;

    // Track active connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId)!.add(socket.id);

    console.log(`User ${userId} connected (socket: ${socket.id})`);

    // Join user-specific room for notifications
    socket.join(`user:${userId}`);

    /**
     * ping event
     * Payload: { ts?: number }
     * Responds with pong for client heartbeat
     */
    socket.on('ping', (payload: any = {}) => {
      socket.emit('pong', {
        ts: payload?.ts || Date.now(),
        serverTs: Date.now()
      });
    });

    /**
     * send_message event
     * Message payload: { conversationId, text }
     */
    socket.on('send_message', async (payload: any) => {
      try {
        const { conversationId, text } = payload;

        if (!conversationId || !text) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'conversationId and text are required'
          });
          return;
        }

        // Send message via service
        const message = await dmService.sendMessage(
          conversationId,
          userId,
          text,
          null
        );

        // Broadcast to all participants in the conversation
        io.to(`conversation:${conversationId}`).emit('receive_message', {
          message,
          conversationId
        });

        // Acknowledge to sender
        socket.emit('message_sent', {
          messageId: message.id,
          conversationId
        });
      } catch (error: any) {
        socket.emit('error', {
          code: 'MESSAGE_SEND_FAILED',
          message: error.message || 'Failed to send message'
        });
      }
    });

    /**
     * typing event
     * Payload: { conversationId }
     */
    socket.on('typing', (payload: any) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'conversationId is required'
          });
          return;
        }

        // Broadcast typing indicator to all in conversation except sender
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          conversationId,
          userName: socket.user.fullName
        });
      } catch (error: any) {
        socket.emit('error', {
          code: 'TYPING_BROADCAST_FAILED',
          message: error.message || 'Failed to broadcast typing'
        });
      }
    });

    /**
     * stop_typing event
     * Payload: { conversationId }
     */
    socket.on('stop_typing', (payload: any) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'conversationId is required'
          });
          return;
        }

        // Broadcast stop typing indicator
        socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
          userId,
          conversationId,
          userName: socket.user.fullName
        });
      } catch (error: any) {
        socket.emit('error', {
          code: 'STOP_TYPING_BROADCAST_FAILED',
          message: error.message || 'Failed to broadcast stop typing'
        });
      }
    });

    /**
     * join_conversation event
     * Join the conversation room for real-time updates
     * Payload: { conversationId }
     */
    socket.on('join_conversation', (payload: any) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'conversationId is required'
          });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error: any) {
        socket.emit('error', {
          code: 'JOIN_CONVERSATION_FAILED',
          message: error.message || 'Failed to join conversation'
        });
      }
    });

    /**
     * join_channel event
     * Join a channel room for real-time updates
     * Payload: { channelId }
     */
    socket.on('join_channel', (payload: any) => {
      try {
        const { channelId } = payload;

        if (!channelId) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'channelId is required'
          });
          return;
        }

        socket.join(`channel:${channelId}`);
        console.log(`User ${userId} joined channel ${channelId}`);
      } catch (error: any) {
        socket.emit('error', {
          code: 'JOIN_CHANNEL_FAILED',
          message: error.message || 'Failed to join channel'
        });
      }
    });

    /**
     * leave_channel event
     * Leave a channel room
     * Payload: { channelId }
     */
    socket.on('leave_channel', (payload: any) => {
      try {
        const { channelId } = payload;

        if (!channelId) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'channelId is required'
          });
          return;
        }

        socket.leave(`channel:${channelId}`);
        console.log(`User ${userId} left channel ${channelId}`);
      } catch (error: any) {
        socket.emit('error', {
          code: 'LEAVE_CHANNEL_FAILED',
          message: error.message || 'Failed to leave channel'
        });
      }
    });

    /**
     * leave_conversation event
     * Leave the conversation room
     * Payload: { conversationId }
     */
    socket.on('leave_conversation', (payload: any) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) {
          socket.emit('error', {
            code: 'INVALID_PAYLOAD',
            message: 'conversationId is required'
          });
          return;
        }

        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);
      } catch (error: any) {
        socket.emit('error', {
          code: 'LEAVE_CONVERSATION_FAILED',
          message: error.message || 'Failed to leave conversation'
        });
      }
    });

    /**
     * Disconnection handler
     */
    socket.on('disconnect', () => {
      const userSockets = activeConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeConnections.delete(userId);
        }
      }
      console.log(`User ${userId} disconnected (socket: ${socket.id})`);
    });

    /**
     * Error handler
     */
    socket.on('error', (error: any) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

/**
 * Get active sockets for a user
 */
export const getActiveSocketIds = (userId: string): string[] => {
  const sockets = activeConnections.get(userId);
  return sockets ? Array.from(sockets) : [];
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  const sockets = activeConnections.get(userId);
  return sockets ? sockets.size > 0 : false;
};

/**
 * Emit event to a conversation room
 */
export const emitToConversation = (conversationId: string, event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(`conversation:${conversationId}`).emit(event, payload);
  }
};

/**
 * Emit event to a channel room
 */
export const emitToChannel = (channelId: string, event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(`channel:${channelId}`).emit(event, payload);
  }
};

/**
 * Emit event to a specific user
 */
export const emitToUser = (userId: string, event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
};
