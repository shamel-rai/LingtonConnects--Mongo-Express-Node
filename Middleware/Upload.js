const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📝 Multer: Storing file in uploads/ directory...");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log("📝 Multer: Processing file:", file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueName + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  console.log("📝 Multer: Filtering file:", file.mimetype);
  const allowedFileTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|mov/;
  const extName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedFileTypes.test(file.mimetype.toLowerCase());

  if (extName && mimeType) {
    console.log("✅ Multer: File accepted.");
    cb(null, true);
  } else {
    console.error("🚨 Multer: Invalid file type.");
    cb(new Error("Only image and video files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

upload.single("profilePicture");

module.exports = upload;
