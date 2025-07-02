const express = require('express');
const Router = express.Router();
const storeSettingsController = require('../controllers/settingsControllers');
const { restrictTo, protect } = require('../controllers/authControllers')
const Cloudinary = require('../config/cloudinary');
const upload = require("../middlewares/multer");

Router.use(protect, restrictTo('admin'))

Router.get('/admin', storeSettingsController.getStoreSettings);
Router.patch('/admin', upload.single("image"), Cloudinary.uploadSingle, storeSettingsController.updateStoreSettings);
Router.delete('/admin', storeSettingsController.deleteStoreSettings);

module.exports = Router;
