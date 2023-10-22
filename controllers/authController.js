const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const user = require('../models/userModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const tokenSign = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createAndSendToken = (user, statusCode, res) => {
  const token = tokenSign(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await user.create(req.body);
  // console.log(newUser);
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });

  createAndSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('enter your email and password', 400));
  }
  const exist = await user.findOne({ email }).select('+password');
  //console.log(exist);
  const correct = await exist.correctPassword(password, exist.password);
  console.log(correct);
  if (!exist || !correct) {
    return next(new ApiError('your email or password doesnot match', 201));
  }
  //console.log('i am hhere');
  //   const token = tokenSign(exist._id);
  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //   });
  createAndSendToken(exist, 200, res);
});
exports.protect = async (req, res, next) => {
  //get token and check if it is there.
  let token;
  console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  }
  if (!token) {
    return next(
      new ApiError('you are not logged in,please do log in to get access', 401)
    );
  }
  //token verification...
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  console.log(decoded);
  //check if the user exist
  const freshUser = await user.findById(decoded.id);
  console.log(freshUser);
  if (!freshUser) {
    return next(
      new ApiError('user associated with the given token is not found', 401)
    );
  }
  console.log('hello i am here');
  //check if the password is changed or not..
  if (freshUser.changePassword(decoded.iat)) {
    return next(new ApiError('password has been changed recently', 401));
  }
  //granting access to the protected routes.
  req.user = freshUser;
  next();
};
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('you donot have permission', 403));
    }
    next();
  };
// exports.createResetpasswordToken= catchAsync(async (req,res,next)=>
//   User= await user.findOne({email:req.email});
//   if(!User){
//     return next(new ApiError('the given email cannot be found',404))
//     }
// );
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const User = await user.findOne({ email: req.body.email });
  if (!User) {
    return next(new ApiError('there is no user with this email', 404));
  }
  const resetToken = User.createResetPasswordToken();
  console.log(resetToken);
  await User.save({ validateBeforeSave: false });

  // res.status(200).json({
  //   status: 'success',
  //   message: 'token sent to the email',nk
  // });
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `you can change your password submitting token,password and confirm password in the url ${resetUrl}`;
  try {
    await sendEmail({
      email: User.email,
      subject: 'your password reset token(available for only 10 minutes)',
      message,
    });
    return res.status(200).json({
      status: 'success',
      message: 'reset token has been sent to your email handler.',
    });
  } catch (err) {
    User.resetPasswordToken = undefined;
    User.resetPasswordExpires = undefined;
    return next(
      new ApiError(
        'something during sending email went wrong,please try again',
        500
      )
    );
  }

  // next();
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user from the token obtained
  // console.log(req.params);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const User = await user.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!User) {
    return next(
      new ApiError(
        'no user found with the given token or the token has got expired try again',
        400
      )
    );
  }
  User.password = req.body.password;
  User.passwordConfirm = req.body.passwordConfirm;
  User.resetPasswordToken = undefined;
  User.resetPasswordExpires = undefined;
  await User.save();

  //console.log(User);
  // const token = tokenSign(User._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  createAndSendToken(User, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //firstupall we get the user from the collection we have in the database.
  console.log(req.params);
  const User = await user.findById(req.user._id).select('+password');
  console.log(User);
  //   if (!User) {
  //     return next(new ApiError('no such user with the given id exist', 400));
  //   }
  // });
  const correct = await User.correctPassword(
    req.body.currentPassword,
    User.password
  );

  // if(User.password!=req.body.password){
  //   return next(new ApiError)
  // }
  if (!correct) {
    return next(
      new ApiError(
        'no user exist with that id rightnow,or the currentpassword that you entered is incorrect'
      )
    );
  }
  User.password = req.body.newPassword;
  User.passwordConfirm = req.body.newPasswordConfirm;
  await User.save();

  // const token = tokenSign(User._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  createAndSendToken(User, 200, res);
});
