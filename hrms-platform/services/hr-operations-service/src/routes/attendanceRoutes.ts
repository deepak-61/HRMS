import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Check in to work
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checked in successfully
 */
router.post('/checkin', attendanceController.checkIn);

/**
 * @swagger
 * /api/attendance/checkout:
 *   post:
 *     summary: Check out from work
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checked out successfully
 */
router.post('/checkout', attendanceController.checkOut);

/**
 * @swagger
 * /api/attendance/my:
 *   get:
 *     summary: Get my attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/my', attendanceController.getMyAttendance);

/**
 * @swagger
 * /api/attendance/all:
 *   get:
 *     summary: Get all attendance records (HR only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all attendance records
 */
router.get('/all', restrictTo('hr manager', 'admin'), attendanceController.getAllAttendance);

/**
 * @swagger
 * /api/attendance/report:
 *   get:
 *     summary: Get attendance report (HR only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance report
 */
router.get('/report', restrictTo('hr manager', 'admin'), attendanceController.getAttendanceReport);

export default router;