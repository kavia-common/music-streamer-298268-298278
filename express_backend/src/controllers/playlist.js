const playlistService = require('../services/playlist');

// PUBLIC_INTERFACE
/**
 * PlaylistController handles HTTP requests for playlist operations.
 * All endpoints return JSON responses with appropriate status codes.
 */
class PlaylistController {
  // PUBLIC_INTERFACE
  /**
   * Create a new playlist for the authenticated user.
   * 
   * @param {Request} req - Express request object with optional { name } in body and user in req.user
   * @param {Response} res - Express response object
   */
  async createPlaylist(req, res) {
    try {
      const userId = req.user.id;
      const { name } = req.body;

      const playlist = await playlistService.createPlaylist(userId, name);

      return res.status(201).json({
        status: 'success',
        message: 'Playlist created successfully',
        data: {
          playlist
        }
      });
    } catch (error) {
      console.error('Create playlist error:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create playlist'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get all playlists for the authenticated user.
   * 
   * @param {Request} req - Express request object with user in req.user
   * @param {Response} res - Express response object
   */
  async getUserPlaylists(req, res) {
    try {
      const userId = req.user.id;

      const playlists = await playlistService.getUserPlaylists(userId);

      return res.status(200).json({
        status: 'success',
        data: {
          playlists
        }
      });
    } catch (error) {
      console.error('Get playlists error:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve playlists'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a single playlist by ID.
   * 
   * @param {Request} req - Express request object with playlist id in params and user in req.user
   * @param {Response} res - Express response object
   */
  async getPlaylistById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const playlist = await playlistService.getPlaylistById(id, userId);

      return res.status(200).json({
        status: 'success',
        data: {
          playlist
        }
      });
    } catch (error) {
      console.error('Get playlist error:', error);
      
      const statusCode = error.message.includes('Access denied') ? 403 : 
                         error.message.includes('not found') ? 404 : 500;
      
      return res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to retrieve playlist'
      });
    }
  }
}

module.exports = new PlaylistController();
