/**
 * Auth Middleware - Verifies Firebase ID tokens.
 * 
 * Extracts Bearer token from Authorization header, verifies it with
 * Firebase Admin SDK, and attaches the decoded user to req.user.
 */

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken || idToken.trim() === '') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token is empty',
    });
  }

  try {
    const admin = req.app.locals.firebaseAdmin;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(`[AUTH] Token verification failed: ${error.code || error.message}`);

    // Differentiate between expired and invalid tokens
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token Expired',
        message: 'Your session has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid authentication token',
    });
  }
}

module.exports = authMiddleware;
