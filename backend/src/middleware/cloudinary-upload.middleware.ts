import multer from 'multer';
import { CloudinaryStorage, Options } from 'multer-storage-cloudinary';
import { Request } from 'express';
import { cloudinary } from '@config/cloudinary.config';

// interface CloudinaryParams extends Options {
//   params: {
//     folder: (req: Request, file: Express.Multer.File) => string;
//     allowed_formats: string[];
//     transformation: { width: number; height: number; crop: string }[];
//   };
// }

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: (req: Request, file: Express.Multer.File) => 'products',

//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ width: 800, height: 800, crop: 'limit' }],
//   },
// } as CloudinaryParams);
const memoryStorage = multer.memoryStorage();

export const uploadProductImageAsync = multer({ 
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req: Request, file: Express.Multer.File) => ({
    public_id: `uploads/${Date.now()}-${file.originalname}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  }),
});

export const uploadProductImage = multer({ storage });
