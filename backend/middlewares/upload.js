const multer = require('multer');
const path = require('path');

// Storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
