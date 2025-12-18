const authService = require('../services/auth');

// PUBLIC_INTERFACE
/**
 * AuthController handles HTTP requests for authentication operations.
 * All endpoints return JSON responses with appropriate status codes.
 */
class AuthController {
  // PUBLIC_INTERFACE
  /**
   * Handle user registration request.
   * 
   * @param {Request} req - Express request object with { email, password, username?, display_name? } in body
   * @param {Response} res - Express response object
   */
  async register(req, res) {
    try {
      const { email, password, username, display_name } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email format'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await authService.register(email, password, username, display_name);

      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            created_at: result.user.created_at
          },
          profile: result.profile,
          session: {
            access_token: result.session?.access_token,
            refresh_token: result.session?.refresh_token,
            expires_at: result.session?.expires_at
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message || 'Registration failed'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Handle user login request.
   * 
   * @param {Request} req - Express request object with { email, password } in body
   * @param {Response} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      const result = await authService.login(email, password);

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            created_at: result.user.created_at
          },
          session: {
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
            expires_at: result.session.expires_at
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      
      // Return generic message for security (don't reveal if email exists)
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Handle user logout request.
   * 
   * @param {Request} req - Express request object with Authorization header
   * @param {Response} res - Express response object
   */
  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'Authorization token is required'
        });
      }

      const jwt = authHeader.substring(7); // Remove 'Bearer ' prefix
      await authService.logout(jwt);

      return res.status(200).json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      return res.status(500).json({
        status: 'error',
        message: 'Logout failed'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get current authenticated user's information.
   * 
   * @param {Request} req - Express request object with Authorization header
   * @param {Response} res - Express response object
   */
  async me(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'Authorization token is required'
        });
      }

      const jwt = authHeader.substring(7); // Remove 'Bearer ' prefix
      const result = await authService.getUser(jwt);

      return res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            created_at: result.user.created_at
          },
          profile: result.profile
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  }
}

module.exports = new AuthController();
