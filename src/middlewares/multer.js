// utils/upload.js
const multer = require('multer');
const storage = multer.memoryStorage(); // Must be memoryStorage!
const upload = multer({ storage });
module.exports = upload;
