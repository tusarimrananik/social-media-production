import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    like: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Post API', () => {
  let mockPrisma: any;
  let validToken: string;
  let userId: string = 'user-1';

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
    validToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid token', async () => {
      mockPrisma.post.create.mockResolvedValue({
        id: 'post-1',
        content: 'Hello World!',
        imageUrl: null,
        authorId: userId,
        author: { username: 'testuser', avatarUrl: null },
      });

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          content: 'Hello World!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'post-1');
      expect(response.body).toHaveProperty('content', 'Hello World!');
    });

    it('should fail if no content or image is provided', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Post must have content or image');
    });

    it('should fail without authorization token', async () => {
       const response = await request(app)
        .post('/api/posts')
        .send({
          content: 'Hello World!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /api/feed', () => {
    it('should fetch the latest posts', async () => {
      mockPrisma.post.findMany.mockResolvedValue([
        {
          id: 'post-1',
          content: 'Test post',
          author: { username: 'testuser', avatarUrl: null },
          _count: { likes: 5 }
        },
      ]);

      const response = await request(app).get('/api/feed');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('content', 'Test post');
    });
  });

  describe('POST /api/posts/:postId/like', () => {
    it('should like a post if not already liked', async () => {
      mockPrisma.like.findUnique.mockResolvedValue(null); // Not liked yet
      mockPrisma.like.create.mockResolvedValue({ id: 'like-1', userId, postId: 'post-1' });

      const response = await request(app)
        .post('/api/posts/post-1/like')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post liked');
    });

    it('should unlike a post if already liked', async () => {
      mockPrisma.like.findUnique.mockResolvedValue({ id: 'like-1', userId, postId: 'post-1' }); // Already liked
      mockPrisma.like.delete.mockResolvedValue({ id: 'like-1' });

      const response = await request(app)
        .post('/api/posts/post-1/like')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post unliked');
    });
  });
});
