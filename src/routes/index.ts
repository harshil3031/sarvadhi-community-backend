import express, { Router } from 'express';

// Import route modules (to be created based on spec)
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import channelRoutes from './channel.routes.js';
import groupRoutes from './group.routes.js';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import dmRoutes from './dm.routes.js';
import notificationRoutes from './notification.routes.js';

const router: Router = express.Router();

// API version info
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Sarvadhi Community API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      channels: '/api/channels',
      groups: '/api/groups',
      posts: '/api/posts',
      comments: '/api/comments',
      dms: '/api/dms',
      notifications: '/api/notifications'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/channels', channelRoutes);
router.use('/groups', groupRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/dms', dmRoutes);
router.use('/notifications', notificationRoutes);

export default router;
