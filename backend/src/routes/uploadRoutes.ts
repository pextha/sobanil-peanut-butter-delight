import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure where to store the files
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save in 'uploads' folder
  },
  filename(req, file, cb) {
    // Rename file to: fieldname-date.extension (e.g., image-123456789.jpg)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type (Allow only Images)
function checkFileType(file: any, cb: any) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// The Route: POST /api/upload
// It expects a single file named 'image'
router.post('/', upload.single('image'), (req, res) => {
  // Return the path like: /uploads/image-123.jpg
  res.send(`/${req.file?.path.replace(/\\/g, '/')}`);
});

export default router;