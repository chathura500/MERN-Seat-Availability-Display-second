const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('./models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,  // Replace with your Google Client ID
    clientSecret: process.env.CLIENT_SECRET, // Replace with your Google Client Secret
    callbackURL: "http://localhost:4000/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let existingUser = await UserModel.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        } else {
            const newUser = new UserModel({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                role: "user",
            });
            const savedUser = await newUser.save();
            return done(null, savedUser);
        }
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
