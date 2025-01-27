const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueName + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|mov/; // Add allowed video file types
  const extName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedFileTypes.test(file.mimeType);
  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error("Only Image and video files are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
