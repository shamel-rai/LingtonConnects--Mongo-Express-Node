// Middleware/Upload.js

const multer = require("multer");
const path = require("path");

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/"); // Folder to save uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueName + path.extname(file.originalname)
    );
  },
});

// File filter for images/videos
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedFileTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|mov/;
  const extName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  // NOTE: must be file.mimetype (all lowercase)
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

// IMPORTANT: This exports `upload` as the default
module.exports = upload;
