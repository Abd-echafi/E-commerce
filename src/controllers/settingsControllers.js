const Setting = require('../models/settingsModel');
const AppError = require('../utils/AppError');
// 🟢 Get store settings
exports.getStoreSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findById('storeConfig');
    if (!settings) {
      return res.status(404).json({ message: 'settings not found.' });
    }
    res.status(200).json(settings);
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// update store 
exports.updateStoreSettings = async (req, res, next) => {
  try {
    if (req.image) {
      req.body.storeImage = req.image;
    }
    const updated = await Setting.findByIdAndUpdate(
      'storeConfig',
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.status(200).json({ status: "success", settings: updated });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};


exports.deleteStoreSettings = async (req, res, next) => {
  try {
    await Setting.findByIdAndDelete('storeConfig');
    res.status(204).json({ message: 'settings deleted in success.' });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

