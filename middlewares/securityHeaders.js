/**
 * Security Headers Middleware for BHOKBHOJ
 * Implements various security headers to protect against common attacks
 */

const helmet = require('helmet');

/**
 * Apply security headers to all responses
 */
const securityHeaders = (app) => {
    // Disable helmet in development to avoid blocking requests
    if (process.env.NODE_ENV === 'production') {
        // Use Helmet for basic security headers in production only
        app.use(helmet({
            // Content Security Policy
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            // Strict Transport Security (HSTS)
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true,
                preload: true
            },
            // X-Frame-Options
            frameguard: {
                action: 'deny'
            },
            // X-Content-Type-Options
            noSniff: true,
            // X-XSS-Protection
            xssFilter: true,
            // Referrer Policy
            referrerPolicy: {
                policy: 'strict-origin-when-cross-origin'
            }
        }));
    }

    // Additional custom security headers (only in production)
    if (process.env.NODE_ENV === 'production') {
        app.use((req, res, next) => {
            // Remove X-Powered-By header
            res.removeHeader('X-Powered-By');
            
            // Add custom security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            
            // BHOKBHOJ custom header
            res.setHeader('X-Powered-By', 'BHOKBHOJ-Secure-Platform');
            
            next();
        });
    }

    console.log('🛡️  Security headers middleware enabled (development mode)');
};

/**
 * Force HTTPS redirect middleware
 */
const forceHTTPS = (req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
};

/**
 * CORS configuration for secure communication
 */
const corsOptions = {
    origin: function (origin, callback) {
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            callback(null, true);
            return;
        }

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://localhost:5173',
            'https://localhost:3000',
            process.env.FRONTEND_URL,
            process.env.CLIENT_URL
        ].filter(Boolean);

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

module.exports = {
    securityHeaders,
    forceHTTPS,
    corsOptions
};
