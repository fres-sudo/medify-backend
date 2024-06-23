import pool from '../config/db.js'; // Assuming you have a db configuration file
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * @description Create a new user
 * @route POST /users
 */
export const createUser = catchAsync(async function (req, res, next) {
  const {
    username,
    email,
    password,
    name,
    surname,
    date_of_birth,
    gender,
    address,
    phone,
    user_type,
  } = req.body;

  try {
    if (
      !username ||
      !email ||
      !password ||
      !name ||
      !surname ||
      !date_of_birth ||
      !gender ||
      !user_type
    ) {
      throw new AppError('All required fields must be provided', 400);
    }

    let sql =
      'INSERT INTO User (username, email, password, name, surname, date_of_birth, gender, address, phone, user_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.query(sql, [
      username,
      email,
      password,
      name,
      surname,
      date_of_birth,
      gender,
      address,
      phone,
      user_type,
    ]);

    return res.status(201).json({ message: 'User has been created' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description Update user details
 * @route PUT /users/:id
 */
export const updateUser = catchAsync(async function (req, res, next) {
  const { id } = req.params;
  const {
    username,
    email,
    password,
    name,
    surname,
    date_of_birth,
    gender,
    address,
    phone,
    user_type,
  } = req.body;

  try {
    if (
      !username ||
      !email ||
      !password ||
      !name ||
      !surname ||
      !date_of_birth ||
      !gender ||
      !user_type
    ) {
      throw new AppError('All required fields must be provided', 400);
    }

    let sql =
      'UPDATE User SET username = ?, email = ?, password = ?, name = ?, surname = ?, date_of_birth = ?, gender = ?, address = ?, phone = ?, user_type = ? WHERE user_id = ?';
    await pool.query(sql, [
      username,
      email,
      password,
      name,
      surname,
      date_of_birth,
      gender,
      address,
      phone,
      user_type,
      id,
    ]);

    return res.status(200).json({ message: 'User has been updated' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description Delete a user
 * @route DELETE /users/:id
 */
export const deleteUser = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  let sql = 'DELETE FROM User WHERE user_id = ?';
  await pool.query(sql, [id]);

  return res.status(204).json();
});
