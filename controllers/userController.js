const user = require('../models/userModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./Factory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUsers = catchAsync(async (req, res) => {
  const users = await user.find();

  res.status(200).json({
    status: 'success',
    length: `${users.length}`,

    data: {
      users,
    },
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new ApiError(
        'use forgot password route to change passwords and stuffs',
        400
      )
    );
  }
  //find the user and update the required fields...
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await user.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res) => {
  const updatedUser = await user.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'data yet not fetched from the file',
  });
};
exports.newUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'data yet not fetched from the file',
  });
};
// exports.updateUser = catchAsync(async (req, res, next) => {
//   const currentUser = await user.findByIdAndUpdate(req.params.id, req.body);
//   if (!currentUser) {
//     return next(new ApiError('no user found', 400));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       currentUser,
//     },
//   });
// });
exports.updateUser = Factory.updateOne(user);
exports.deleteUser = Factory.deleteOne(user);
