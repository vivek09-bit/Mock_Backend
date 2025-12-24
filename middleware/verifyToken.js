const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get the token from the Authorization header
    if (!token) {
        return res.status(403).json({ message: 'Access denied, no token provided' });
    }

    try {
            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Support tokens that store user ID as either `userId` or `id`
            req.userId = decoded.userId || decoded.id;
        next(); // Call the next middleware or route handler
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
