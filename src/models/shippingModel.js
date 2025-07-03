const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  wilaya: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['domicil', 'stopdesk'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  retourPrice: {
    type: Number,
    required: true,
    min: 0
  },
  wilaya_id: {
    type: String,
  }
}, {
  timestamps: true
});

const Shipping = mongoose.model('Shipping', shippingSchema);
module.exports = Shipping;
