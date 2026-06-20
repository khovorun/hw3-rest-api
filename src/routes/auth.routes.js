import { Router } from 'express'

import {
  register,
  login,
  me,
  refresh,
  logout,
} from '../controllers/auth.controller.js'

import {
  registerValidator,
  loginValidator,
} from '../validators/auth.validator.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - name
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         name:
 *           type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  registerValidator,
  register
)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  loginValidator,
  login
)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/me',
  authenticate,
  me
)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', refresh)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
  '/logout',
  authenticate,
  logout
)

export default router