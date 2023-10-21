class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const reqObj = { ...this.queryString }; //destruturing and creating a new object so that changing reqObj doesnot change the original value of the req.query..
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => {
      delete reqObj[el];
    });
    //console.log(req.query, reqObj);
    //advanced filtering...
    //example like: const query = Tour.find({duration:{$gte:5},difficulty:'easy'})
    let queryStr = JSON.stringify(reqObj);
    queryStr = queryStr.replace(/gte|gt|lt|lte/g, (match) => `$${match}`); //here we have made use of regular expression.
    //console.log(JSON.parse(queryStr));
    //const query = Tour.find(JSON.parse(queryStr));
    //console.log(query);
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //sorting........
    //for sorting using multiple fields we can write query.sort(price createdAt)
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      //console.log(sortBy);
      this.query.sort(sortBy);
    } else {
      this.query.sort('createdAt');
    }
    return this;
  }

  limitField() {
    //limiting fields...... it is similar as projection meaning we can specify how many columns we want to project.
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const tourNum = await Tour.countDocuments();
    //   if (skip >= tourNum)
    //     throw new Error('the page u willing to see doesnot exist');
    // }
    return this;
  }
}
module.exports = ApiFeatures;
