/**
 * Audit Log Model
 * Stores comprehensive audit trail of all system activities
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    username: {
        type: String,
        default: 'Anonymous'
    },
    userEmail: {
        type: String,
        default: null
    },
    userRole: {
        type: String,
        default: 'guest'
    },

    // Action Details
    action: {
        type: String,
        required: true,
        enum: [
            // Authentication
            'LOGIN', 'LOGOUT', 'REGISTER', 'OTP_VERIFY', 'PASSWORD_RESET',
            'PASSWORD_CHANGE', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED',
            
            // User Management
            'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_VIEW',
            'PROFILE_UPDATE', 'ROLE_CHANGE',
            
            // Product Management
            'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_VIEW',
            
            // Order Management
            'ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_DELETE', 'ORDER_VIEW',
            'ORDER_STATUS_CHANGE', 'ORDER_CANCEL',
            
            // Payment
            'PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
            
            // Category Management
            'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
            
            // Restaurant Management
            'RESTAURANT_CREATE', 'RESTAURANT_UPDATE', 'RESTAURANT_DELETE',
            
            // Cart Operations
            'CART_ADD', 'CART_UPDATE', 'CART_REMOVE', 'CART_CLEAR',
            
            // Security Events
            'UNAUTHORIZED_ACCESS', 'INVALID_TOKEN', 'SUSPICIOUS_ACTIVITY',
            'BRUTE_FORCE_ATTEMPT', 'SQL_INJECTION_ATTEMPT',
            
            // System Events
            'SERVER_START', 'SERVER_STOP', 'DATABASE_CONNECT', 'DATABASE_DISCONNECT',
            'API_ERROR', 'SYSTEM_ERROR',
            
            // File Operations
            'FILE_UPLOAD', 'FILE_DELETE', 'FILE_ACCESS',
            
            // Admin Actions
            'ADMIN_LOGIN', 'ADMIN_ACTION', 'SETTINGS_CHANGE',
            
            // Other
            'OTHER'
        ]
    },
    
    actionCategory: {
        type: String,
        enum: ['AUTHENTICATION', 'USER_MANAGEMENT', 'PRODUCT', 'ORDER', 'PAYMENT', 
               'SECURITY', 'SYSTEM', 'ADMIN', 'FILE', 'OTHER'],
        required: true
    },

    // Request Details
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        default: 'GET'
    },
    endpoint: {
        type: String,
        required: true
    },
    
    // Status
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING', 'ERROR'],
        required: true
    },
    statusCode: {
        type: Number,
        default: 200
    },

    // Details
    description: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Request/Response Data
    requestBody: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    responseData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    
    // Error Information
    errorMessage: {
        type: String,
        default: null
    },
    errorStack: {
        type: String,
        default: null
    },

    // Network Information
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    deviceType: {
        type: String,
        enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
        default: 'Unknown'
    },
    browser: {
        type: String,
        default: 'Unknown'
    },
    os: {
        type: String,
        default: 'Unknown'
    },

    // Location (optional)
    location: {
        country: String,
        city: String,
        region: String
    },

    // Performance Metrics
    responseTime: {
        type: Number, // in milliseconds
        default: 0
    },
    
    // Security Flags
    isSecure: {
        type: Boolean,
        default: false
    },
    isSuspicious: {
        type: Boolean,
        default: false
    },
    
    // Metadata
    sessionId: {
        type: String,
        default: null
    },
    correlationId: {
        type: String,
        default: null
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true,
    collection: 'audit_logs'
});

// Indexes for better query performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ actionCategory: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// Static method to create audit log
auditLogSchema.statics.createLog = async function(logData) {
    try {
        const log = new this(logData);
        await log.save();
        return log;
    } catch (error) {
        console.error('Error creating audit log:', error);
        return null;
    }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
    return this.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

// Static method to get security events
auditLogSchema.statics.getSecurityEvents = async function(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.find({
        actionCategory: 'SECURITY',
        timestamp: { $gte: since }
    }).sort({ timestamp: -1 }).lean();
};

// Static method to get failed login attempts
auditLogSchema.statics.getFailedLogins = async function(ipAddress, hours = 1) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.countDocuments({
        action: 'LOGIN',
        status: 'FAILURE',
        ipAddress,
        timestamp: { $gte: since }
    });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
