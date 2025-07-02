const express = require('express');
const Router = express.Router();
const shippingController = require('../controllers/shippingControllers');
const { protect, restrictTo } = require('../controllers/authControllers');

// Admin-only routes
Router.post('/admin/bulk', protect, restrictTo('admin'), shippingController.createBulkShipping);
Router.post('/admin', protect, restrictTo('admin'), shippingController.createShipping);

Router
  .route('/admin/:id')
  .patch(protect, restrictTo('admin'), shippingController.updateShipping)
  .delete(protect, restrictTo('admin'), shippingController.deleteShipping);

// Public routes
Router.get('/', shippingController.getAllShippings);
Router.get('/one/', shippingController.getShippingByWilayaAndType);

module.exports = Router;
