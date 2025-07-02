const express = require('express');
const { login, signup, logout, sendResetCode, verifyEmail, verifyResetCode, resetPassword, protect } = require('../controllers/authControllers');
const Router = express.Router();
require('dotenv').config();

// Admin routes
Router.route('/admin/signup').post(signup);
Router.route('/admin/login').post(login);
Router.route("/admin/verify-email/:token").post(verifyEmail);
Router.route('/admin/logout').get(protect, logout);
Router.route('/admin/forgot-password').post(sendResetCode);
Router.route('/admin/verify-reset-code').post(verifyResetCode);
Router.route('/admin/reset-password').post(resetPassword);

// Manager routes
Router.route('/manager/signup').post(signup);
Router.route('/manager/login').post(login);
Router.route("/manager/verify-email/:token").post(verifyEmail);
Router.route('/manager/logout').get(protect, logout);
Router.route('/manager/forgot-password').post(sendResetCode);
Router.route('/manager/verify-reset-code').post(verifyResetCode);
Router.route('/manager/reset-password').post(resetPassword);

// Client routes
Router.route('/client/signup').post(signup);
Router.route('/client/login').post(login);
Router.route("/client/verify-email/:token").post(verifyEmail);
Router.route('/client/logout').get(protect, logout);
Router.route('/client/forgot-password').post(sendResetCode);
Router.route('/client/verify-reset-code').post(verifyResetCode);
Router.route('/client/reset-password').post(resetPassword);

// Worker routes
Router.route('/worker/signup').post(signup);
Router.route('/worker/login').post(login);
Router.route("/worker/verify-email/:token").post(verifyEmail);
Router.route('/worker/logout').get(protect, logout);
Router.route('/worker/forgot-password').post(sendResetCode);
Router.route('/worker/verify-reset-code').post(verifyResetCode);
Router.route('/worker/reset-password').post(resetPassword);

module.exports = Router;