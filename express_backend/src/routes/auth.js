const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and profile management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email and password, and initializes their profile in the database.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: mySecurePassword123
 *               username:
 *                 type: string
 *                 description: Optional username
 *                 example: johndoe
 *               display_name:
 *                 type: string
 *                 description: Optional display name
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     profile:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           format: uuid
 *                         username:
 *                           type: string
 *                           nullable: true
 *                         display_name:
 *                           type: string
 *                           nullable: true
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *                         expires_at:
 *                           type: number
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register.bind(authController));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user with email and password, returning a session token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *                         expires_at:
 *                           type: number
 *       400:
 *         description: Bad request - missing credentials
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the user's session token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Missing or invalid authorization token
 *       500:
 *         description: Server error
 */
router.post('/logout', authController.logout.bind(authController));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently authenticated user's information and profile.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     profile:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           format: uuid
 *                         username:
 *                           type: string
 *                           nullable: true
 *                         display_name:
 *                           type: string
 *                           nullable: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/me', authController.me.bind(authController));

module.exports = router;
