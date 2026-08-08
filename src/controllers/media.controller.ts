import { Request, Response } from 'express';
import { generatePresignedUploadUrl } from '../utils/s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const getUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, contentType, type } = req.body;
    
    const folder = type === 'avatar' ? 'avatars' : 'posts';

    if (!filename || !contentType) {
      res.status(400).json({ error: 'Filename and contentType are required' });
      return;
    }

    if (!contentType.startsWith('image/')) {
      res.status(400).json({ error: 'Only image uploads are allowed' });
      return;
    }

    const extension = path.extname(filename) || '';
    const userId = (req as any).user?.id || 'unknown';
    
    const uniqueFilename = `${uuidv4()}${extension}`;
    const key = `${folder}/${userId}/${Date.now()}-${uniqueFilename}`;

    const { uploadUrl, fileUrl } = await generatePresignedUploadUrl(key, contentType);

    res.status(200).json({
      uploadUrl,
      fileUrl,
      key
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};
