const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,

    required: [true, 'please tell us your name'],
    minlength: 5,
    maxlength: 20,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'provide your emailid'],
    validate: [validator.isEmail, 'provide valid email'],
  },
  role: {
    type: 'string',
    enum: ['admin', 'lead-guide', 'guide', 'user'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'fill your password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwordconfirm should be same as password',
    },
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //here we subtracted with 1000 millisecond so as to ensure that the jwt token is always issued before the password has changed

  next();
});
//queryMiddleWare
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//instance object,it is available to all the documents in a certain collection.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changePassword = function (jwtTimeStamp) {
  //console.log(changedTimeStamp, jwtTimeStamp);
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(this.passwordChangedAt, jwtTimeStamp);
    return jwtTimeStamp < changedTimeStamp;
  }
  return false;
};
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
