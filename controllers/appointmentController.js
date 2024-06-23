import { pool } from '../server.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * @description Create a new appointment
 * @route POST /appointments
 */
export const createAppointment = catchAsync(async function (req, res, next) {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } =
    req.body;

  try {
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      throw new AppError('All fields are required', 400);
    }

    // Additional validation logic if needed

    let sql =
      'INSERT INTO Appointment (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
    ]);

    return res.status(201).json({ message: 'Appointment has been created' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description Get all appointments
 * @route GET /appointments
 */
export const getAppointments = catchAsync(async function (req, res, next) {
  let sql = 'SELECT * FROM Appointment';
  const appointments = await pool.query(sql);

  return res.status(200).json({ appointments });
});

/**
 * @description Get appointment by ID
 * @route GET /appointments/:id
 */
export const getAppointmentById = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  let sql = 'SELECT * FROM Appointment WHERE appointment_id = ?';
  const [appointment] = await pool.query(sql, [id]);

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  return res.status(200).json({ appointment });
});

/**
 * @description Update an appointment
 * @route PUT /appointments/:id
 */
export const updateAppointment = catchAsync(async function (req, res, next) {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } =
    req.body;

  try {
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      throw new AppError('All fields are required', 400);
    }

    // Additional validation logic if needed

    let sql =
      'UPDATE Appointment SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, reason = ? WHERE appointment_id = ?';
    await pool.query(sql, [
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      id,
    ]);

    return res.status(200).json({ message: 'Appointment has been updated' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description Delete an appointment
 * @route DELETE /appointments/:id
 */
export const deleteAppointment = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  let sql = 'DELETE FROM Appointment WHERE appointment_id = ?';
  await pool.query(sql, [id]);

  return res.status(204).json();
});
