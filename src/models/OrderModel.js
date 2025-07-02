const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false
  },
  guestEmail: {
    type: String,
    required: false,
    unique: false,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  }, // required if user is null
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      priceAtPurchase: Number
    }
  ],
  shippingDetails: {
    name: String,
    phone: String,
    wilaya: String,
    commune: String,
    type: String,
  },
  totalAmount: Number,
  isPaid: Boolean,
  status: {
    type: String,
    enum: ["Pending", "confirmed", "shipped", "retour", "delivered", "cancelled"],
    default: 'pending'
  },
  workerAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
  }
}, { timestamps: true });


const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
