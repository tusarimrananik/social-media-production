import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('User API', () => {
  let mockPrisma: any;
  let validToken: string;
  let userId: string = 'user-1';

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
    validToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
  });

  describe('GET /api/users/:username', () => {
    it('should fetch user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        username: 'testuser',
        bio: 'Test bio',
        avatarUrl: null,
        posts: [],
        _count: { posts: 0, likes: 0 }
      });

      const response = await request(app).get('/api/users/testuser');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('bio', 'Test bio');
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/users/notfounduser');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        username: 'testuser',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          bio: 'Updated bio',
          avatarUrl: 'https://example.com/avatar.png'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bio', 'Updated bio');
      expect(response.body).toHaveProperty('avatarUrl', 'https://example.com/avatar.png');
    });

    it('should fail without authorization token', async () => {
       const response = await request(app)
        .put('/api/users/profile')
        .send({
          bio: 'Updated bio',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
