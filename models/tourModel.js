const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

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
  startLocation: {
    //embeded or denormalized data sets
    //use of geolocation values for embeding or denormalizing data sets.
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId, //this is the way to use child referencing here the reference to the user object will only be stored.
      ref: 'User',
    },
  ],
});
//middlewares in mongoose.....document middleware here this refers for the document before saving to the database.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { toupper: true });
  next();
});
// tourSchema.pre('save',async function(next){    //in this way we can embed the user who are guide into the tour documets..
//   const guidesPromises=this.guides.map( async id=>await user.findById(id))
//   this.guides= await Promise.all(guidesPromises);
//   next();
// })

//query middlewares..here this refers for queryObject
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//aggregation middlewares....
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
