const Order = require('../models/OrderModel');
const Setting = require('../models/settingsModel');
const Worker = require('./models/Worker');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/feautures');


exports.createOrder = async (req, res) => {
  const { source } = req.body;

  try {
    let orderItems = [];
    let totalAmount = 0;

    if (source === "cart") {
      // Get user cart from DB
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price
      }));

      totalAmount = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    }

    if (source === "direct") {
      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      orderItems.push({
        product: product._id,
        quantity,
        priceAtPurchase: product.price
      });

      totalAmount = product.price * quantity;
    }

    // Create order
    const order = await Order.create({
      user: req.user?._id || null,
      guestEmail: req.user ? null : req.body.guestEmail,
      orderItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress
    });

    // Optional: clear cart
    if (source === "cart") await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({ status: "success", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};
