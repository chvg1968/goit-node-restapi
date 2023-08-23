// Configure Multer for the "public" folder
const multer = require('multer');
const path = require('path');

const publicStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'avatars'), // Store in the "public/avatars" folder
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const publicUpload = multer({ storage: publicStorage });

module.exports = publicUpload;

