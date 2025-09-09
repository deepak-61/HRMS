import { Router } from 'express';
import * as leaveController from '../controllers/leaveController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/leave/requests:
 *   get:
 *     summary: Get my leave requests
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave requests
 *   post:
 *     summary: Create a new leave request
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Leave request created successfully
 */
router.route('/requests')
  .get(leaveController.getMyLeaveRequests)
  .post(leaveController.createLeaveRequest);

/**
 * @swagger
 * /api/leave/requests/all:
 *   get:
 *     summary: Get all leave requests (HR only)
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all leave requests
 */
router.get('/requests/all', restrictTo('hr manager', 'admin'), leaveController.getAllLeaveRequests);

/**
 * @swagger
 * /api/leave/requests/{id}:
 *   patch:
 *     summary: Update leave request
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave request updated successfully
 *   delete:
 *     summary: Delete leave request
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Leave request deleted successfully
 */
router.route('/requests/:id')
  .patch(leaveController.updateLeaveRequest)
  .delete(leaveController.deleteLeaveRequest);

/**
 * @swagger
 * /api/leave/balance:
 *   get:
 *     summary: Get my leave balance
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave balance information
 */
router.get('/balance', leaveController.getLeaveBalance);

/**
 * @swagger
 * /api/leave/balance/{employeeId}:
 *   get:
 *     summary: Get employee leave balance (HR only)
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee leave balance information
 */
router.get('/balance/:employeeId', restrictTo('hr manager', 'admin'), leaveController.getLeaveBalance);

export default router;