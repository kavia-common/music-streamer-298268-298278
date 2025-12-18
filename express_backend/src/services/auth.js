const { getSupabaseClient } = require('../config/supabase');

// PUBLIC_INTERFACE
/**
 * AuthService handles all authentication-related operations including user registration,
 * login, logout, and profile management using Supabase.
 */
class AuthService {
  constructor() {
    this.supabase = getSupabaseClient();
  }

  // PUBLIC_INTERFACE
  /**
   * Register a new user with email and password, then create their profile.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} username - Optional username for the profile
   * @param {string} displayName - Optional display name for the profile
   * @returns {Promise<{user: object, profile: object}>} Registered user and profile data
   * @throws {Error} If registration or profile creation fails
   */
  async register(email, password, username = null, displayName = null) {
    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(`Registration failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Registration failed: No user data returned');
    }

    // Create profile entry for the new user
    const { data: profileData, error: profileError } = await this.supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        username: username,
        display_name: displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Note: User is created in auth but profile failed - this is logged for manual intervention
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return {
      user: authData.user,
      profile: profileData,
      session: authData.session
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate a user with email and password.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{user: object, session: object}>} User and session data
   * @throws {Error} If login fails
   */
  async login(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed: No user or session data returned');
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Sign out a user by invalidating their JWT token.
   * 
   * @param {string} jwt - User's JWT token
   * @returns {Promise<void>}
   * @throws {Error} If logout fails
   */
  async logout(jwt) {
    // Create a client with the user's JWT for logout
    const { error } = await this.supabase.auth.admin.signOut(jwt);

    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get the current user's information from their JWT token.
   * 
   * @param {string} jwt - User's JWT token
   * @returns {Promise<{user: object, profile: object}>} User and profile data
   * @throws {Error} If user retrieval fails
   */
  async getUser(jwt) {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error('Authentication failed: Invalid or expired token');
    }

    // Fetch the user's profile
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Return user without profile if profile doesn't exist
      return { user, profile: null };
    }

    return { user, profile };
  }
}

module.exports = new AuthService();
