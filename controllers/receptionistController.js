import pool from '../config/db.js'; // Assuming you have a db configuration file
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * @description Get associated doctor details for a receptionist
 * @route GET /receptionists/:id/associated-doctor
 */
export const getAssociatedDoctor = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  let sql = 'SELECT * FROM Doctor WHERE receptionist_id = ?';
  const [doctor] = await pool.query(sql, [id]);

  if (!doctor) {
    return next(new AppError('Associated doctor not found', 404));
  }

  return res.status(200).json(doctor);
});

/**
 * @description Get all appointments of associated doctors for a receptionist
 * @route GET /receptionists/:id/appointments
 */
export const getAllAppointmentsOfDoctors = catchAsync(async function (
  req,
  res,
  next
) {
  const { id } = req.params;

  let sql =
    'SELECT * FROM Appointment WHERE doctor_id IN (SELECT doctor_id FROM Doctor WHERE receptionist_id = ?)';
  const appointments = await pool.query(sql, [id]);

  return res.status(200).json({ appointments });
});

/**
 * @description Get all medical histories of associated doctors for a receptionist
 * @route GET /receptionists/:id/medical-histories
 */
export const getAllMedicalHistoriesOfDoctors = catchAsync(async function (
  req,
  res,
  next
) {
  const { id } = req.params;

  let sql =
    'SELECT * FROM MedicalHistory WHERE patient_id IN (SELECT patient_id FROM Patient WHERE doctor_id IN (SELECT doctor_id FROM Doctor WHERE receptionist_id = ?))';
  const medicalHistories = await pool.query(sql, [id]);

  return res.status(200).json({ medicalHistories });
});
