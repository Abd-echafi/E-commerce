const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/feautures');
//Create new product
exports.createProduct = async (req, res, next) => {
  try {
    if (req.images) {
      req.body.images = req.images;
    }
    //send colors and sizes in array of strings
    const product = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      data: product
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

//Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Product.find().populate('category'),
      req.query // not req.params.query
    )
      .filter()
      .sort()
      .paginate();
    const finalProducts = await features.query;
    res.status(200).json({
      status: 'success',
      results: finalProducts.length,
      data: finalProducts
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

//Get single product by ID
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      throw new AppError("product not found", 404)
      return;
    }
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

//Update product
exports.updateProduct = async (req, res, next) => {
  try {
    //auto recalculate price here if needed
    if (req.images.length !== 0) {
      req.body.images = req.images;
    }
    if (
      req.body.costPerUnit !== undefined ||
      req.body.profit !== undefined ||
      req.body.packagingCost !== undefined
    ) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ status: 'fail', message: 'Product not found' });
      }

      product.set(req.body); // update fields
      product.price = product.costPerUnit + product.profit + product.packagingCost;
      await product.save();

      return res.status(200).json({ status: 'success', data: product });
    }

    // If no cost fields changed, use normal update
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false
    });

    if (!updated) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};

//Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(new AppError(err.message, 400))
  }
};
