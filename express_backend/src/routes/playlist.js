const express = require('express');
const playlistController = require('../controllers/playlist');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: User playlist management endpoints
 */

/**
 * @swagger
 * /api/playlists:
 *   post:
 *     summary: Create a new playlist
 *     description: Creates a new playlist for the authenticated user with a default or custom name. The playlist is created with owner_id from the authenticated user session.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional playlist name (defaults to 'New Playlist')
 *                 example: My Awesome Playlist
 *     responses:
 *       201:
 *         description: Playlist created successfully
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
 *                   example: Playlist created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     playlist:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           description: Unique playlist identifier
 *                         owner_id:
 *                           type: string
 *                           format: uuid
 *                           description: User ID of the playlist owner
 *                         name:
 *                           type: string
 *                           description: Playlist name
 *                         description:
 *                           type: string
 *                           nullable: true
 *                           description: Playlist description
 *                         is_public:
 *                           type: boolean
 *                           description: Whether playlist is public
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: Creation timestamp
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           description: Last update timestamp
 *       401:
 *         description: Missing or invalid authorization token
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, playlistController.createPlaylist.bind(playlistController));

/**
 * @swagger
 * /api/playlists:
 *   get:
 *     summary: Get user's playlists
 *     description: Retrieves all playlists owned by the authenticated user with minimal fields (id, name, created_at, updated_at).
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Playlists retrieved successfully
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
 *                     playlists:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Missing or invalid authorization token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, playlistController.getUserPlaylists.bind(playlistController));

/**
 * @swagger
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by ID
 *     description: Retrieves a specific playlist by ID. User must be the owner or the playlist must be public.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist retrieved successfully
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
 *                     playlist:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         owner_id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                           nullable: true
 *                         is_public:
 *                           type: boolean
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Missing or invalid authorization token
 *       403:
 *         description: Access denied to this playlist
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, playlistController.getPlaylistById.bind(playlistController));

module.exports = router;
