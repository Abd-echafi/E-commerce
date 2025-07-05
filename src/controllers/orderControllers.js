const Cart = require('../models/CartModel');
const Product = require('../models/productModel');
const Order = require('../models/OrderModel');
const Worker = require('../models/workerModel');
const Setting = require('../models/settingsModel');
const Shipping = require('../models/shippingModel')
const AppError = require('../utils/AppError')
const APIFeatures = require('../utils/feautures');
const axios = require('axios');

exports.createAndAssignOrder = async (req, res, next) => {
  const {
    source,
    productId,
    quantity,
    guestEmail,
    shippingAddress,
    guestCartItems // expected to be [{ productId, quantity, color, size }]
  } = req.body;

  try {
    let orderItems = [];
    let totalAmount = 0;

    //  Registered User - Cart
    if (source === "cart" && req.user) {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.product.totalPrice
      }));

      totalAmount = orderItems.reduce((sum, item) => sum + item.priceAtPurchase, 0);

      // Optional: clear cart
      await Cart.findOneAndDelete({ user: req.user._id });
    }

    //  Guest - Cart
    else if (source === "cart" && !req.user) {
      if (!guestCartItems || guestCartItems.length === 0) {
        return res.status(400).json({ message: "Guest cart is empty" });
      }

      for (const item of guestCartItems) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const price = product.totalPrice || product.price;
        totalAmount += price * item.quantity;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: price
        });
      }
    }

    //  Registered/Guest - Direct Buy
    if (source === "direct") {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const price = product.totalPrice || product.price;
      totalAmount = price * quantity;

      orderItems.push({
        product: product._id,
        quantity,
        price: price
      });
    }
    //  Add Shipping
    const { wilaya, type } = shippingAddress;
    const shipping = await Shipping.findOne({ wilaya, type });
    if (!shipping) return res.status(404).json({ message: "Shipping info not found" });
    const totalAmountWithShipping = totalAmount + shipping.price;

    //  Create Order
    const order = await Order.create({
      user: req.user?._id || null,
      guestEmail: req.user ? null : guestEmail,
      orderItems,
      totalAmount: totalAmountWithShipping,
      shippingDetails: shippingAddress,
    });
    //  Worker Assignment Logic
    const workers = await Worker.find({ isActive: true }).sort({ _id: 1 });
    if (workers.length === 0) {
      const populatedOrder = await order.populate({
        path: 'orderItems.product',
        select: 'name price images'
      });
      res.status(201).json({ status: "success", orderAssigned: false, order: populatedOrder });
    } else {
      let setting = await Setting.findById('orderAssignment');
      if (!setting) {
        setting = await Setting.create({ _id: 'orderAssignment', lastWorkerId: null });
      }

      let nextWorker;
      if (!setting.lastWorkerId) {
        nextWorker = workers[0];
      } else {
        const index = workers.findIndex(w => w._id.equals(setting.lastWorkerId));
        nextWorker = (index === -1 || index === workers.length - 1) ? workers[0] : workers[index + 1];
      }


      order.workerAssigned = nextWorker._id
      const finalOrder = await order.save();
      const populatedOrder = await finalOrder.populate({
        path: 'orderItems.product',
        select: 'name price images'
      });

      //  Update setting
      setting.lastWorkerId = nextWorker._id;
      await setting.save({ validateBeforeSave: false });

      res.status(201).json({ status: "success", orderAssigned: true, order: populatedOrder });
    }
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};


// get all orders 
exports.getAllOrders = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Order.find().populate({
        path: 'orderItems.product',
        select: 'name price '
      }).populate({
        path: 'workerAssigned',
        select: 'name'
      }).select('guestEmail status totalAmount shippingDetails.name shippingDetails.phone user createdAt'),
      req.query // not req.params.query
    ).filter().sort().paginate();
    const finalOrders = await features.query;
    res.status(200).json({ status: "success", number: finalOrders.length, orders: finalOrders });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
}

//get my orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const guestEmail = req.body?.guestEmail
    let query;
    const orders = await Order.find({ guestEmail })
    console.log(orders);
    if (!req.user) {
      query = Order.find({ guestEmail }).populate({
        path: 'orderItems.product',
        select: 'name price images'
      }).select('guestEmail status totalAmount shippingDetails user createdAt orderItems.quantity')
    } else {
      query = Order.find({ user: req.user._id }).populate({
        path: 'orderItems.product',
        select: 'name price images'
      }).select('guestEmail status totalAmount shippingDetails user createdAt  orderItems.quantity')
    }
    const features = new APIFeatures(
      query,
      req.query // not req.params.query
    )
      .filter()
      .sort()
      .paginate();
    const finalProducts = await features.query;
    res.status(200).json({ status: "success", number: finalProducts.length, orders: finalProducts })
  } catch (err) {
    next(new AppError(err.message, 400))
  }
}

// get all orders assigned to me 
exports.getMyAssignedOrders = async (req, res, next) => {
  try {
    const workerId = req.user._id
    const features = new APIFeatures(
      Order.find({ workerAssigned: workerId }).populate({
        path: 'orderItems.product',
        select: 'name price images'
      }).select('guestEmail status totalAmount shippingDetails user createdAt  orderItems.quantity'),
      req.query // not req.params.query
    )
      .filter()
      .sort()
      .paginate();
    const finalProducts = await features.query;
    res.status(200).json({ status: "success", number: finalProducts.length, orders: finalProducts })
  } catch (err) {
    next(new AppError(err.message, 400))
  }
}

//update order status 
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;
    const order = await Order.findById(orderId).populate({
      path: 'user',
      select: 'name'
    }).populate({
      path: 'orderItems.product',
      select: 'name price images'
    });

    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }

    let updatedOrder;

    if (req.user.role === 'admin' || req.user._id.toString() === order.workerAssigned?.toString()) {
      order.status = status;
      updatedOrder = await order.save({ new: true, runValidators: true });
      //get wilaya id 
      const shipping = await Shipping.findOne({ wilaya: order.shippingDetails.wilaya }).select('wilaya_id')
      const wilaya_id = shipping.wilaya_id
      // After confirming, send to delivery company
      if (status === "Confirmed") {
        const deliveryData = {
          Colis: [
            {
              Tracking: order._id.toString(),
              TypeLivraison: order.shippingDetails.type === "domicil" ? "0" : "1",
              TypeColis: "0",
              Confrimee: "1",
              Client: order.shippingDetails.name,
              MobileA: order.shippingDetails.phone,
              MobileB: "",
              Adresse: "",
              IDWilaya: wilaya_id,
              Commune: order.shippingDetails.commune,
              Total: order.totalAmount.toString(),
              Note: "",
              TProduit: order.orderItems.map(item => item.product.name).join("+ "), // You may need to populate `product`
              id_Externe: order._id.toString(),
              Source: ""
            }
          ]
        };
        // await axios.post("https://delivery-company.com/api/add_colis", deliveryData, {
        //   headers: {
        //     token: "VOTRE TOKEN",
        //     key: "VOTRE CLE",
        //     "Content-Type": "application/json"
        //   }
        // });
      }

      return res.status(200).json({ status: "success", order: updatedOrder });

    } else {
      return res.status(401).json({
        status: "fail",
        message: "You are not authorized to update this order"
      });
    }

  } catch (err) {
    console.error(err);
    next(new AppError(err.message, 400));
  }
};

// get my assigned orders data within specific time (worker)
exports.getAssignedOrdersData = async (req, res, next) => {
  try {
    const worker = req.params.workerId
    const user = req.user
    if (user.role !== 'admin') {
      if (user._id.toString() !== worker.toString()) {
        return res.status(401).json({ status: "fail", message: "you can not access to another worker stats" })
      }
    }
    let { date } = req.query;
    let startDate, endDate;

    const now = new Date();

    if (date === 'Today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    if (date === 'Last-Week') {
      const lastWeekStart = new Date();
      lastWeekStart.setDate(now.getDate() - 7);
      startDate = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate()); // 7 days ago at 00:00
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    if (date === 'Last-Month') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); // same day last month
      startDate = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth(), lastMonthStart.getDate()); // Start of that day
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    let condition;
    if (startDate && endDate) {
      condition = {
        updatedAt: {
          $gte: startDate,
          $lte: endDate
        },
      }
    }

    const orders = await Order.find({
      ...condition,
      workerAssigned: worker,
    });
    const confirmedCount = Object.values(orders).filter(order => order.status === 'Confirmed').length;
    const cancelledCount = Object.values(orders).filter(order => order.status === 'Cancelled').length;
    const DeliveredCount = Object.values(orders).filter(order => order.status === 'Delivered').length;
    const returnedCount = Object.values(orders).filter(order => order.status === 'Retour').length;
    const shippedCount = Object.values(orders).filter(order => order.status === 'Shipped').length;
    const pendingCount = Object.values(orders).filter(order => order.status === 'Pending').length;
    const statistics = {
      Confirmed: confirmedCount,
      Cacelled: cancelledCount,
      Delivered: DeliveredCount,
      Retour: returnedCount,
      Shipped: shippedCount,
      Pending: pendingCount,
    }
    res.status(200).json({ status: "success", data: statistics })
  } catch (err) {
    next(new AppError(err.message, 400));
  }
}

