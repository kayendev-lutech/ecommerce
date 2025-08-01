import multer from 'multer';
import { CloudinaryStorage, Options } from 'multer-storage-cloudinary';
import { Request } from 'express';
import { cloudinary } from '@config/cloudinary.config';

interface CloudinaryParams extends Options {
  params: {
    folder: (req: Request, file: Express.Multer.File) => string;
    allowed_formats: string[];
    transformation: { width: number; height: number; crop: string }[];
  };
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req: Request, file: Express.Multer.File) => 'products',

    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
} as CloudinaryParams);

export const uploadProductImage = multer({ storage });
