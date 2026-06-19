import { Router } from 'express'

import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.controller.js'

import {
  getAnnouncementsValidator,
  idValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
} from '../validators/announcements.validator.js'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         contactInfo:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements
 *     tags:
 *       - Announcements
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get(
  '/',
  getAnnouncementsValidator,
  getAnnouncements
)

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Get announcement by ID
 *     tags:
 *       - Announcements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcement found
 */
router.get(
  '/:id',
  idValidator,
  getAnnouncementById
)

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create announcement
 *     tags:
 *       - Announcements
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       201:
 *         description: Announcement created
 */
router.post(
  '/',
  createAnnouncementValidator,
  createAnnouncement
)

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update announcement
 *     tags:
 *       - Announcements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcement updated
 */
router.patch(
  '/:id',
  idValidator,
  updateAnnouncementValidator,
  updateAnnouncement
)

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete announcement
 *     tags:
 *       - Announcements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Announcement deleted
 */
router.delete(
  '/:id',
  idValidator,
  deleteAnnouncement
)

export default router
