const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Create an 'uploads/' folder in your project root
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
module.exports = multer({ storage });
