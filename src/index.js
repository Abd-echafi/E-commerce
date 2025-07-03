require('dotenv').config(); // Load environment variables
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/authRoutes");
const categoryRouter = require("./routes/categoryRoutes")
const ProductRouter = require("./routes/productRoutes");
const ShippingRouter = require('./routes/shippingRoutes')
const CartRouter = require('./routes/cartRoutes');
const settingsRouter = require('./routes/settingsRoutes')
const orderRouter = require('./routes/orderRoutes');
const { createServer } = require("http");

const app = express();
const httpServer = createServer(app);
//cors
app.use(cors({
    origin: ['http://localhost:5173'], // remove trailing slashes
    credentials: true,
}));

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/product', ProductRouter)
app.use('/api/v1/shipping', ShippingRouter)
app.use('/api/v1/cart', CartRouter)
app.use('/api/v1/settings', settingsRouter)
app.use('/api/v1/order', orderRouter)
// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: 'Resource not found',
    });
});


// Global error handler (optional, centralized error handling)
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: "fail",
        message: err.message || 'Server Error',
    });
});

module.exports = httpServer;