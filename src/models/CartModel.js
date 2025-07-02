const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  color: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  },
  totalPrice: {
    type: Number,
    default: 0,
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

cartSchema.pre('save', async function (next) {
  const itemPrices = this.items;
  this.totalPrice = itemPrices.reduce((acc, curr) => acc + curr.totalPrice, 0);
  next(); // Call next() to proceed
});


module.exports = mongoose.model('Cart', cartSchema);
