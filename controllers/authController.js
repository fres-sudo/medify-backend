import mysql from 'mysql2/promise';
import { pool } from '../server.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';
import crypto from 'crypto';
import otpGenerator from 'otp-generator';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { Email } from '../utils/email.js'; // Assuming you have email sending functionality

// Promisify query function
const query = promisify(pool.query).bind(pool);

// Function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

// Middleware to protect routes
export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user exists
  const [rows] = await query('SELECT * FROM User WHERE id = ?', [decoded.id]);
  const currentUser = rows[0];

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  // Check if user changed password after token was issued
  const [passwordRows] = await query(
    'SELECT * FROM User WHERE id = ? AND password_changed_at > ?',
    [decoded.id, currentUser.password_changed_at]
  );
  if (passwordRows.length > 0) {
    return next(
      new AppError(
        'User recently changed their password. Please log in again',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

// Middleware to restrict access based on user roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Function to create and send token
const createSendToken = (id, statusCode, res) => {
  const token = signToken(id);

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

// Signup function
export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert user into database
  const [result] = await query(
    'INSERT INTO User (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );

  // Get inserted user ID
  const userId = result.insertId;

  // Send token
  createSendToken(userId, 201, res);
});

// Login function
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Retrieve user from database
  const [rows] = await query('SELECT * FROM User WHERE email = ?', [email]);
  const user = rows[0];

  // Check if user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Send token
  createSendToken(user.id, 200, res);
});

// Forgot password function
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set password reset fields in database
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  await query(
    'UPDATE User SET password_reset_token = ?, password_reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?',
    [hashedToken, email]
  );

  // Send reset token to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.`;

  // Assuming Email class handles sending emails
  const emailSender = new Email(user, resetToken);
  await emailSender.sendPasswordReset();

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

// Reset password function
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  // Hash token and find user with hashed token and valid expiry
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const [rows] = await query(
    'SELECT * FROM User WHERE password_reset_token = ? AND password_reset_expires > NOW()',
    [hashedToken]
  );
  const user = rows[0];

  // If no user or token expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Update user password
  const hashedPassword = await bcrypt.hash(password, 12);
  await query(
    'UPDATE User SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );

  // Send token
  createSendToken(user.id, 200, res);
});

// Update password function
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  // Retrieve user from database
  const [rows] = await query('SELECT * FROM User WHERE id = ?', [req.user.id]);
  const user = rows[0];

  // Check if current password is correct
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // Check if new passwords match
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Update user password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await query('UPDATE User SET password = ? WHERE id = ?', [
    hashedPassword,
    user.id,
  ]);

  // Send token
  createSendToken(user.id, 200, res);
});
