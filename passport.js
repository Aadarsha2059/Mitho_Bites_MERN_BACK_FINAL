const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');

module.exports = function(passport) {
  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5051/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Try to find by email (in case user registered locally)
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.provider = 'google';
          await user.save();
        } else {
          user = await User.create({
            fullname: profile.displayName || 'Google User',
            username: profile.emails[0].value.split('@')[0],
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8), // random password
            phone: '0000000000', // placeholder
            address: 'Google OAuth', // placeholder
            googleId: profile.id,
            provider: 'google',
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  // Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID || 'FACEBOOK_CLIENT_ID_PLACEHOLDER',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'FACEBOOK_CLIENT_SECRET_PLACEHOLDER',
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5051/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      if (!user) {
        // Try to find by email (in case user registered locally)
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        user = await User.findOne({ email });
        if (user) {
          user.facebookId = profile.id;
          user.provider = 'facebook';
          await user.save();
        } else {
          user = await User.create({
            fullname: profile.displayName || 'Facebook User',
            username: email ? email.split('@')[0] : `fb_${profile.id}`,
            email: email || `fb_${profile.id}@facebook.com`,
            password: Math.random().toString(36).slice(-8), // random password
            phone: '0000000000', // placeholder
            address: 'Facebook OAuth', // placeholder
            facebookId: profile.id,
            provider: 'facebook',
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  // Serialize/deserialize
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}; 