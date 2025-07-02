const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productControllers');
const { protect, restrictTo } = require('../controllers/authControllers');
const Cloudinary = require('../config/cloudinary');
const upload = require("../middlewares/multer");
const Router = express.Router();
//admin routes

Router
  .route('/admin')
  .post(protect, restrictTo("admin"), upload.array("images"), Cloudinary.uploadMultiple, createProduct)

Router
  .route('/admin/:id')
  .patch(protect, restrictTo("admin"), upload.array("images"), Cloudinary.uploadMultiple, updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);
//manager routes
Router
  .route('/manager/')
  .post(protect, restrictTo("manager"), upload.array("images"), Cloudinary.uploadMultiple, createProduct)

Router
  .route('/manager/:id')
  .patch(protect, restrictTo("manager"), upload.array("images"), Cloudinary.uploadMultiple, updateProduct)
  .delete(protect, restrictTo("manager"), deleteProduct);

// all users and guest
Router.route("/").get(getAllProducts);
Router.route('/:id').get(getProduct)
module.exports = Router;
