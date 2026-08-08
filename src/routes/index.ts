import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { createPost, getFeed, likePost } from '../controllers/post.controller';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { getUploadUrl } from '../controllers/media.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// User Routes
router.get('/users/:username', getProfile);
router.put('/users/profile', authMiddleware, updateProfile);

// Post Routes
router.get('/feed', getFeed);
router.post('/posts', authMiddleware, createPost);
router.post('/posts/:postId/like', authMiddleware, likePost);

// Media Routes
router.post('/media/upload-url', authMiddleware, getUploadUrl);

export default router;