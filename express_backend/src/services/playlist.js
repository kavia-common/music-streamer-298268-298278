const { getSupabaseClient } = require('../config/supabase');

// PUBLIC_INTERFACE
/**
 * PlaylistService handles all playlist-related operations including creation,
 * retrieval, and management using Supabase.
 */
class PlaylistService {
  constructor() {
    this.supabase = getSupabaseClient();
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new playlist for a user with a default name.
   * 
   * @param {string} userId - The user's ID from auth context
   * @param {string} name - Optional playlist name (defaults to 'New Playlist')
   * @returns {Promise<object>} Created playlist data
   * @throws {Error} If playlist creation fails
   */
  async createPlaylist(userId, name = 'New Playlist') {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('playlists')
      .insert({
        owner_id: userId,
        name: name,
        description: null,
        is_public: false,
        created_at: now,
        updated_at: now
      })
      .select('id, owner_id, name, description, is_public, created_at, updated_at')
      .single();

    if (error) {
      console.error('Playlist creation error:', error);
      throw new Error(`Failed to create playlist: ${error.message}`);
    }

    return data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get all playlists owned by a user.
   * 
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} Array of user's playlists with minimal fields
   * @throws {Error} If retrieval fails
   */
  async getUserPlaylists(userId) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, created_at, updated_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Playlist retrieval error:', error);
      throw new Error(`Failed to retrieve playlists: ${error.message}`);
    }

    return data || [];
  }

  // PUBLIC_INTERFACE
  /**
   * Get a single playlist by ID, ensuring user has access.
   * 
   * @param {string} playlistId - The playlist ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<object>} Playlist data
   * @throws {Error} If playlist not found or access denied
   */
  async getPlaylistById(playlistId, userId) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, owner_id, name, description, is_public, created_at, updated_at')
      .eq('id', playlistId)
      .single();

    if (error) {
      console.error('Playlist fetch error:', error);
      throw new Error(`Failed to fetch playlist: ${error.message}`);
    }

    // Check access: owner or public playlist
    if (data.owner_id !== userId && !data.is_public) {
      throw new Error('Access denied to this playlist');
    }

    return data;
  }
}

module.exports = new PlaylistService();
