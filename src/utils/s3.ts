import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy_secret',
  },
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'social-media-uploads-bucket';

export const generatePresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600 // 1 hour
): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  
  const fileUrl = process.env.S3_PUBLIC_DOMAIN 
    ? `${process.env.S3_PUBLIC_DOMAIN}/${key}`
    : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
};
