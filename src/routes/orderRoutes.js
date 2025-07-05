const express = require('express');
const { createAndAssignOrder, getAllOrders, getMyOrders, getMyAssignedOrders, updateOrderStatus, getOneOrderById, getAssignedOrdersData } = require('../controllers/orderControllers')
const { protect, restrictTo } = require('../controllers/authControllers');
const Router = express.Router();

// Create order (guest & registered)
Router.post('/client', protect, restrictTo('client'), createAndAssignOrder); // works for both car and direct for registred client
Router.post('/guest', createAndAssignOrder);// works for both car and direct for guest

//get all orders (admin)
Router.get('/admin/', protect, restrictTo('admin'), getAllOrders)
Router.get('/worker/', protect, restrictTo('worker'), getAllOrders)

// get my orders
Router.get('/client/', protect, restrictTo('client'), getMyOrders)
Router.get('/guest/', getMyOrders)

// get my assigned orders
Router.get('/worker/', protect, restrictTo('worker'), getMyAssignedOrders)

// update orders status
Router.patch('/admin/:id', protect, restrictTo('admin'), updateOrderStatus)
Router.patch('/worker/:id', protect, restrictTo('worker'), updateOrderStatus)

// get statistics about orders status assigned to a specific worker 
Router.get('/admin/statistics/:workerId', protect, restrictTo('admin'), getAssignedOrdersData)
Router.get('/worker/statistics/:workerId', protect, restrictTo('worker'), getAssignedOrdersData)

module.exports = Router;