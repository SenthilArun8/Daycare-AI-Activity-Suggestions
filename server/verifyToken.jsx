const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Get token from the Authorization header
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assuming JWT_SECRET is stored in your environment variables
    req.user = decoded; // Attach the user info to the request (decoded token)
    next(); // Call the next middleware or route handler
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

module.exports = verifyToken;
