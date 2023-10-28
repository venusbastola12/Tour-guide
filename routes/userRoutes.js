const express = require('express');
const {
  getUsers,
  getUser,
  newUser,
  updateUser,
  updateMe,
  deleteMe,
  deleteUser,
} = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();
userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);
userRouter.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
userRouter.patch('/updateMe', authController.protect, updateMe);
userRouter.delete('/deleteMe', authController.protect, deleteMe);
userRouter.delete('/:id', deleteUser);

userRouter.route('/').get(getUsers).post(newUser);

userRouter.route('/:id').get(getUser).patch(updateUser);

module.exports = userRouter;
