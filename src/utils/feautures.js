const Model = require('../models/productModel');

class APIFeautures {
    constructor(query, queryfile) {
        this.query = query;
        this.queryfile = queryfile;
    }

    //filter method 
    filter = () => {
        // simple filtering
        const { minPrice, maxPrice, search, category } = this.queryfile;
        const query = {};
        if (search) query.model = { $regex: `^${search}`, $options: 'i' };
        if (category) query.category.name = category;
        if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
        if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
        this.query = this.query.find(query);
        return this;
    }

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
        const page = this.queryfile.page;
        const skip = (page - 1) * 10;
        this.query = this.query.skip(skip).limit(10);
        return this
    }
}

module.exports = APIFeautures;