const Category = require('../models/categoryModel');
const AppError = require('../utils/AppError');

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: categories
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

//Get single category by ID
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

// Update category by ID
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

//Delete category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};
