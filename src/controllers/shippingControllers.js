const Shipping = require('../models/shippingModel');
const AppError = require('../utils/AppError')
// Create new shipping
exports.createShipping = async (req, res) => {
  try {
    const shipping = await Shipping.create(req.body);
    res.status(201).json(shipping);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all shippings
exports.getAllShippings = async (req, res, next) => {
  try {
    const shippings = await Shipping.find();
    res.status(200).json(shippings);
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// Get shipping by ID
exports.getShippingByWilayaAndType = async (req, res, next) => {
  try {
    const { wilaya, type } = req.body;

    const shipping = await Shipping.findOne({ wilaya, type })
    if (!shipping) {
      return res.status(404).json({ error: 'Shipping not found' });
    }
    res.status(200).json(shipping);
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// Update shipping by ID
exports.updateShipping = async (req, res, next) => {
  try {
    const { price, retourPrice } = req.body
    const updatedShipping = await Shipping.findByIdAndUpdate(
      req.params.id,
      { price, retourPrice },
      { new: true, runValidators: true }
    );
    if (!updatedShipping) {
      return res.status(404).json({ error: 'Shipping not found' });
    }
    res.status(200).json(updatedShipping);
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// Delete shipping by ID
exports.deleteShipping = async (req, res, next) => {
  try {
    const deletedShipping = await Shipping.findByIdAndDelete(req.params.id);
    if (!deletedShipping) {
      return res.status(404).json({ error: 'Shipping not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};


// Bulk create shippings
exports.createBulkShipping = async (req, res) => {
  try {
    const shippings = await Shipping.insertMany(req.body);
    res.status(201).json({
      message: 'Bulk shipping data inserted successfully',
      count: shippings.length,
      data: shippings
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
