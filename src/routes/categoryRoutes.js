const express = require('express');
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, restrictTo } = require('../controllers/authControllers');
const Router = express.Router();

Router
  .route('/admin')
  .post(protect, restrictTo("admin"), createCategory)
  .get(protect, restrictTo("admin"), getAllCategories);

Router
  .route('/admin/:id')
  .get(protect, restrictTo("admin"), getCategory)
  .patch(protect, restrictTo("admin"), updateCategory)
  .delete(protect, restrictTo("admin"), deleteCategory);

module.exports = Router;
