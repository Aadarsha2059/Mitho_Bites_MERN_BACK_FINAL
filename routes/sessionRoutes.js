/**
 * Session Management Routes
 * View and manage active sessions
 */

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { authGuard } = require('../middlewares/authGuard');
const { endSession } = require('../middlewares/sessionMiddleware');

// Get all active sessions for current user
router.get('/my-sessions', authGuard, async (req, res) => {
    try {
        const sessions = await Session.getActiveSessions(req.user.id);

        const sessionsData = sessions.map(session => ({
            id: session._id,
            deviceType: session.deviceInfo.deviceType,
            browser: session.deviceInfo.browser,
            os: session.deviceInfo.os,
            ipAddress: session.ipAddress,
            location: session.location,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            expiresAt: session.expiresAt,
            isCurrent: session.token === req.headers.authorization?.split(' ')[1]
        }));

        return res.status(200).json({
            success: true,
            message: 'Active sessions retrieved successfully',
            data: sessionsData,
            count: sessionsData.length
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// End a specific session
router.delete('/session/:sessionId', authGuard, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.sessionId,
            userId: req.user.id,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        await endSession(session.token, 'forced');

        return res.status(200).json({
            success: true,
            message: 'Session ended successfully'
        });
    } catch (error) {
        console.error('End session error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// End all other sessions (keep current)
router.post('/end-other-sessions', authGuard, async (req, res) => {
    try {
        const currentToken = req.headers.authorization?.split(' ')[1];

        const result = await Session.updateMany(
            {
                userId: req.user.id,
                isActive: true,
                token: { $ne: currentToken }
            },
            {
                isActive: false,
                endedAt: new Date(),
                endReason: 'forced'
            }
        );

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} session(s) ended successfully`,
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('End other sessions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Logout (end current session)
router.post('/logout', authGuard, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            await endSession(token, 'logout');
        }

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Get session statistics
router.get('/session-stats', authGuard, async (req, res) => {
    try {
        const activeSessions = await Session.countDocuments({
            userId: req.user.id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        const totalSessions = await Session.countDocuments({
            userId: req.user.id
        });

        const recentSessions = await Session.find({
            userId: req.user.id
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('deviceInfo ipAddress createdAt lastActivity isActive endReason');

        return res.status(200).json({
            success: true,
            data: {
                activeSessions,
                totalSessions,
                recentSessions
            }
        });
    } catch (error) {
        console.error('Session stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
