const express = require('express');
const {
  addToCart,
  updateCartItem,
  getCart,
  deleteCart
} = require('../controllers/cartControllers');
const { protect, restrictTo } = require('../controllers/authControllers');

const Router = express.Router();


Router.post('/client/', protect, restrictTo("client"), addToCart);
Router.get('/client/', protect, restrictTo("client"), getCart);
Router.patch('/client/item/:itemId', protect, restrictTo("client"), updateCartItem);
Router.delete('/client/', protect, restrictTo("client"), deleteCart);

module.exports = Router;
