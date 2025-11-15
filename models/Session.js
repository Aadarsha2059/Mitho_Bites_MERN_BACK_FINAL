/**
 * Session Model
 * Tracks active user sessions across devices
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Device Information
    deviceInfo: {
        deviceType: {
            type: String,
            enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
            default: 'Unknown'
        },
        browser: String,
        os: String,
        userAgent: String
    },
    
    // Location Information
    ipAddress: {
        type: String,
        required: true
    },
    location: {
        country: String,
        city: String,
        region: String
    },
    
    // Session Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastActivity: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    
    // Session ended
    endedAt: {
        type: Date,
        default: null
    },
    endReason: {
        type: String,
        enum: ['logout', 'timeout', 'forced', 'expired', null],
        default: null
    }
}, {
    timestamps: true
});

// Index for cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create new session
sessionSchema.statics.createSession = async function(userId, token, deviceInfo, ipAddress) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    const session = new this({
        userId,
        token,
        deviceInfo,
        ipAddress,
        expiresAt
    });
    
    await session.save();
    return session;
};

// Static method to update last activity
sessionSchema.statics.updateActivity = async function(token) {
    const session = await this.findOne({ token, isActive: true });
    
    if (session) {
        session.lastActivity = new Date();
        session.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Extend 15 minutes
        await session.save();
        return session;
    }
    
    return null;
};

// Static method to end session
sessionSchema.statics.endSession = async function(token, reason = 'logout') {
    const session = await this.findOne({ token, isActive: true });
    
    if (session) {
        session.isActive = false;
        session.endedAt = new Date();
        session.endReason = reason;
        await session.save();
        return session;
    }
    
    return null;
};

// Static method to get active sessions for user
sessionSchema.statics.getActiveSessions = async function(userId) {
    return this.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });
};

// Static method to end all sessions for user
sessionSchema.statics.endAllUserSessions = async function(userId, reason = 'forced') {
    return this.updateMany(
        { userId, isActive: true },
        { 
            isActive: false, 
            endedAt: new Date(),
            endReason: reason
        }
    );
};

// Static method to check if session is valid
sessionSchema.statics.isSessionValid = async function(token) {
    const session = await this.findOne({ 
        token, 
        isActive: true,
        expiresAt: { $gt: new Date() }
    });
    
    return !!session;
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpiredSessions = async function() {
    const result = await this.updateMany(
        { 
            isActive: true,
            expiresAt: { $lt: new Date() }
        },
        { 
            isActive: false,
            endedAt: new Date(),
            endReason: 'timeout'
        }
    );
    
    return result.modifiedCount;
};

module.exports = mongoose.model('Session', sessionSchema);
