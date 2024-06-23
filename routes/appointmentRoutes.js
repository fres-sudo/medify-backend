import express from 'express';
import * as authController from './../controllers/authController.js';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from './../controllers/appointmentController.js';

const router = express.Router();

router
  .route('/')
  .post(authController.protect, createAppointment)
  .get(authController.protect, getAppointments);

router
  .route('/:id')
  .get(authController.protect, getAppointmentById)
  .put(authController.protect, updateAppointment)
  .delete(authController.protect, deleteAppointment);

export default router;
