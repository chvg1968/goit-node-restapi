const multer = require('multer');
const path = require('path');

// Configure Multer for the "tmp" folder
const tmpStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'tmp'), // Temporary storage in the "tmp" folder
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const tmpUpload = multer({ storage: tmpStorage });

module.exports = tmpUpload;
