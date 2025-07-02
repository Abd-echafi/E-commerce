const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product title is required"],
    trim: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
  },
  discountPrice: {
    type: Number
  },
  quantity: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  colors: {
    type: [String],
    default: undefined
  },
  sizes: {
    type: [String],
    default: undefined
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, "Product must belong to a category"]
  },
  costPerUnit: {
    type: Number,
    required: [true, "you need to enter the cost of unit for that product "]
  },
  profit: {
    type: Number,
    required: [true, "you must enter the desired profit"]
  },
  packagingCost: {
    type: Number,
    required: [true, "you must enter the packaging cost per unit"]
  }
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length <= 10;
}

productSchema.pre('save', function (next) {
  this.price = this.costPerUnit + this.profit + this.packagingCost;
  next();
});
module.exports = mongoose.model('Product', productSchema);
