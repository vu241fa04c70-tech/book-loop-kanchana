const cloudinary = require('cloudinary').v2;

// Configure Cloudinary credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Uploads a file path or buffer to Cloudinary
 * @param {string} filePath - Absolute path to local file
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadToCloudinary = async (filePath, folder = 'bookloop_books') => {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 1200, height: 1600, crop: 'limit', quality: 'auto' }]
  });

  return result.secure_url;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary
};
