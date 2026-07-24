const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — compatible with multer v2
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * Usage: const url = await uploadToCloudinary(req.file.buffer, 'sherides');
 */
const uploadToCloudinary = (buffer, folder = 'sherides') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }],
      },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = { cloudinary, upload, uploadToCloudinary };
