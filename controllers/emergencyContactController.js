import pool from '../config/db.js'; // Assuming you have a db configuration file
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * @description Create a new emergency contact
 * @route POST /emergency-contacts
 */
export const createEmergencyContact = catchAsync(async function (
  req,
  res,
  next
) {
  const { name, relationship, phone, email } = req.body;

  try {
    if (!name || !phone) {
      throw new AppError('Name and phone number are required', 400);
    }

    let sql =
      'INSERT INTO EmergencyContact (name, relationship, phone, email) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [name, relationship, phone, email]);

    return res
      .status(201)
      .json({ message: 'Emergency contact has been created' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description Update an emergency contact
 * @route PUT /emergency-contacts/:id
 */
export const updateEmergencyContact = catchAsync(async function (
  req,
  res,
  next
) {
  const { id } = req.params;
  const { name, relationship, phone, email } = req.body;

  try {
    if (!name || !phone) {
      throw new AppError('Name and phone number are required', 400);
    }

    let sql =
      'UPDATE EmergencyContact SET name = ?, relationship = ?, phone = ?, email = ? WHERE emergency_contact_id = ?';
    await pool.query(sql, [name, relationship, phone, email, id]);

    return res
      .status(200)
      .json({ message: 'Emergency contact has been updated' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description Delete an emergency contact
 * @route DELETE /emergency-contacts/:id
 */
export const deleteEmergencyContact = catchAsync(async function (
  req,
  res,
  next
) {
  const { id } = req.params;

  let sql = 'DELETE FROM EmergencyContact WHERE emergency_contact_id = ?';
  await pool.query(sql, [id]);

  return res.status(204).json();
});
