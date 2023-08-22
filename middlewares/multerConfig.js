const multer = require('multer');

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/avatars'); // Carpeta de destino para los avatares
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Renombrar el archivo para evitar duplicados
  },
});

// Crear una instancia de multer con la configuración de almacenamiento
const upload = multer({ storage: storage });

module.exports = upload;
