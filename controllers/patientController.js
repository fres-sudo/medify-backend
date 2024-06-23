import pool from '../config/db.js'; // Assuming you have a db configuration file
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * @description Get appointments of the current patient
 * @route GET /patients/:id/appointments
 */
export const getMyAppointments = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  let sql = 'SELECT * FROM Appointment WHERE patient_id = ?';
  const appointments = await pool.query(sql, [id]);

  return res.status(200).json({ appointments });
});

/**
 * @description Get medical history of the current patient
 * @route GET /patients/:id/medical-history
 */
export const getMedicalHistory = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  let sql = 'SELECT * FROM MedicalHistory WHERE patient_id = ?';
  const medicalHistory = await pool.query(sql, [id]);

  return res.status(200).json({ medicalHistory });
});
