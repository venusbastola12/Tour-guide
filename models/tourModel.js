const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
  name: {
    type: 'string',
    unique: true,
    required: [true, 'a tour must have a name'],
  },
  slug: 'string',
  ratingAverage: {
    type: 'number',
    //default: 4.5,
    min: 1.0, // inbuilt validators for number
    max: 5.0,
  },
  ratingsQuantity: { type: 'number' },
  price: {
    type: 'number',
    required: [true, 'a tour must have a price'],
  },
  priceDiscount: {
    type: 'number',
    default: 200,
    validate: {
      //custom validators
      validator: function (value) {
        return value < this.price; //here the 'this' keyword refers to the current document that is being created.
      },
      message:
        'the discount amount must be smaller than the original price of the tour',
    },
  },
  duration: {
    type: 'number',
  },
  maxGroupSize: {
    type: 'number',
    default: 15,
  },
  summary: {
    type: 'string',
  },
  description: {
    type: 'string',
  },
  difficulty: {
    type: 'string',
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'difficulty can be either easy,medium or difficult', //inbuilt validator for string.
    },
  },
  imageCover: {
    type: 'string',
    required: [true, 'a tour must have a cover image'],
  },
  images: ['string'],
  startDates: ['date'],
  createdAt: {
    type: 'date',
    default: `${Date.now()}`,
  },
  secretTour: {
    type: 'boolean',
    default: false,
  },
});
//middlewares in mongoose.....document middleware here this refers for the document before saving to the database.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { toupper: true });
  next();
});

//query middlewares..here this refers for queryObject
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

//aggregation middlewares....
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
