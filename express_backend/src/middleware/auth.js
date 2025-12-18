const { getSupabaseClient } = require('../config/supabase');

// PUBLIC_INTERFACE
/**
 * Authentication middleware that verifies JWT tokens and attaches user info to request.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization token is required'
      });
    }

    const jwt = authHeader.substring(7); // Remove 'Bearer ' prefix
    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(jwt);

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Attach user info to request for use in controllers
    req.user = user;
    req.jwt = jwt;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
}

module.exports = {
  authenticateToken
};
