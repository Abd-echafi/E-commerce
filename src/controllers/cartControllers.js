const Cart = require('../models/CartModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// Add or create cart only for registred client
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, color, size } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid product ID" });

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // create new cart
      const totalPrice = product.price * quantity
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity, color, size, totalPrice }]
      });
    } else {
      // check if item exists
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.price
      } else {
        const totalPrice = product.price * quantity
        cart.items.push({ product: productId, quantity, color, size, totalPrice });
      }
      await cart.save();
    }
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images'
    });
    res.status(200).json({ status: "success", Cart: populatedCart });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// Update quantity or remove item
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity, productId } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1); // remove item
    } else {
      const product = await Product.findById(productId)
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.price
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images'
    });
    res.status(200).json({ status: "success", cart: populatedCart });
  } catch (err) {

  }
};

// Get cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price images'
    });
    if (!cart) return res.status(200).json({ cart: [] });

    res.status(200).json({ status: "success", cart });
  } catch (err) {

  }
};

// Delete cart
exports.deleteCart = async (req, res, next) => {
  try {

    const userId = req.user._id;
    await Cart.findOneAndDelete({ user: userId });
    res.status(204).json({ status: "success", message: "Cart deleted" });

  } catch (err) {
    next(new AppError(err.message, 400))
  }
};
