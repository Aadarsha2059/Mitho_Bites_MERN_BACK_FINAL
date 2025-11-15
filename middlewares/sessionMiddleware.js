/**
 * Session Management Middleware
 * Handles session timeout and activity tracking
 */

const Session = require('../models/Session');
const jwt = require('jsonwebtoken');

// Helper to detect device type
const detectDevice = (userAgent) => {
    if (!userAgent) return 'Unknown';
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
};

// Helper to detect browser
const detectBrowser = (userAgent) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
};

// Helper to detect OS
const detectOS = (userAgent) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
};

// Middleware to check session validity and update activity
const sessionCheck = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const decoded = jwt.verify(token, process.env.SECRET || 'your-secret-key-here');

        // Check if session exists and is valid
        const session = await Session.findOne({
            token,
            userId: decoded.id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.',
                code: 'SESSION_EXPIRED'
            });
        }

        // Update last activity and extend expiration
        session.lastActivity = new Date();
        session.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Extend 15 minutes
        await session.save();

        // Attach session to request
        req.session = session;
        req.userId = decoded.id;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
                code: 'TOKEN_EXPIRED'
            });
        }
        next();
    }
};

// Create session on login
const createSession = async (userId, token, req) => {
    const userAgent = req.get('user-agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

    const deviceInfo = {
        deviceType: detectDevice(userAgent),
        browser: detectBrowser(userAgent),
        os: detectOS(userAgent),
        userAgent: userAgent
    };

    const session = await Session.createSession(userId, token, deviceInfo, ipAddress);
    return session;
};

// End session on logout
const endSession = async (token, reason = 'logout') => {
    return await Session.endSession(token, reason);
};

// Cleanup expired sessions (run periodically)
const cleanupExpiredSessions = async () => {
    const count = await Session.cleanupExpiredSessions();
    console.log(`🧹 Cleaned up ${count} expired sessions`);
    return count;
};

// Schedule cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

module.exports = {
    sessionCheck,
    createSession,
    endSession,
    cleanupExpiredSessions
};
