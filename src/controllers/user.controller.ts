import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, bio: true, avatarUrl: true, createdAt: true,
        posts: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { likes: true } } } },
        _count: { select: { posts: true, likes: true } }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { bio, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { bio, avatarUrl },
      select: { id: true, username: true, bio: true, avatarUrl: true }
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
