const Product = require('../models/productModel');
const AppError = require('../utils/AppError')
const APIFeatures = require('../utils/feautures');
const Order = require('../models/OrderModel');
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

// get product sales statistics
exports.getAllProductSalesStatistics = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return next(new AppError("Please provide both month and year", 400));
    }

    // Create start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate order items by product and status
    const result = await Order.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["Delivered", "Retour"] }
        }
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: {
            product: "$orderItems.product",
            status: "$status"
          },
          quantity: { $sum: "$orderItems.quantity" }
        }
      }
    ]);

    // Get unique product IDs
    const productIds = [...new Set(result.map(r => r._id.product.toString()))];

    // Fetch product info
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // Final totals
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalCost = 0;
    let totalPackagingCost = 0;
    let totalRetourCost = 0;

    const breakdown = [];

    for (const entry of result) {
      const { product, status } = entry._id;
      const quantity = entry.quantity;
      const p = productMap[product.toString()];
      if (!p) continue;

      const price = p.price || 0;
      const cost = p.costPerUnit || 0;
      const profit = p.profit || 0;
      const packagingCost = p.packagingCost || 0;

      let confirmedQty = 0;
      let retourQty = 0;

      if (status === "Delivered") {
        totalRevenue += quantity * price;
        totalCost += quantity * cost;
        totalProfit += quantity * profit;
        totalPackagingCost += quantity * packagingCost;
        confirmedQty = quantity;
      }

      if (status === "Retour") {
        totalRetourCost += quantity * 200;
        totalPackagingCost += quantity * packagingCost;
        retourQty = quantity;
      }

      const existing = breakdown.find(b => b.productId === product.toString());

      if (existing) {
        existing.DeliveredQty += confirmedQty;
        existing.retourQty += retourQty;
      } else {
        breakdown.push({
          productId: product.toString(),
          productName: p.name,
          DeliveredQty: confirmedQty,
          retourQty,
          price,
          cost,
          profit,
          packagingCost
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        month,
        year,
        summary: {
          totalRevenue,
          totalProfit,
          totalCost,
          totalPackagingCost,
          totalRetourCost
        },
        breakdown // per product
      }
    });

  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

