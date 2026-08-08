import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { content, imageUrl } = req.body;
    const authorId = req.user!.id;
    
    if (!content && !imageUrl) {
        return res.status(400).json({ error: 'Post must have content or image' });
    }

    const post = await prisma.post.create({
      data: { content, imageUrl, authorId },
      include: { author: { select: { username: true, avatarUrl: true } } }
    });
    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

export const getFeed = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { likes: true } }
      }
    });
    return res.json(posts);
  } catch (error) {
    console.error(error); return res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const userId = req.user!.id;

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.json({ message: 'Post unliked' });
    }

    await prisma.like.create({ data: { userId, postId } });
    return res.json({ message: 'Post liked' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
};
