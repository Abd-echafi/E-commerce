const Model = require('../models/productModel');

class APIFeautures {
    constructor(query, queryfile) {
        this.query = query;
        this.queryfile = queryfile;
    }

    //filter method 
    filter = () => {
        const { minPrice, maxPrice, search, searchOrders, startDate, endDate, category, Orderstatus } = this.queryfile;
        const query = {};
        if (search) {
            query.model = { $regex: `^${search}`, $options: 'i' };
        }
        if (searchOrders) {
            query['shippingDetails.phone'] = { $regex: searchOrders, $options: 'i' };
        }
        if (startDate) {
            query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
        }
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        }
        if (category) {
            query['category.name'] = { $regex: category, $options: 'i' };
        }
        if (minPrice) {
            query.price = { ...query.price, $gte: Number(minPrice) };
        }
        if (maxPrice) {
            query.price = { ...query.price, $lte: Number(maxPrice) };
        }
        if (Orderstatus) {
            query.status = Orderstatus;
        }
        this.query = this.query.find(query);
        return this;
    };


    sort = () => {
        if (!this.queryfile.sort) {
            return this;
        }
        const sortOptions = this.queryfile.sort.split(',').join(' ');
        console.log(sortOptions);
        this.query = this.query.sort(sortOptions);
        console.log(this.query);
        return this;
    }

    paginate = () => {
        const page = parseInt(this.queryfile.page, 10) || 1;
        const limit = parseInt(this.queryfile.limit, 10) || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

}

module.exports = APIFeautures;