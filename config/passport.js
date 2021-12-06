const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
    // Local Strategy
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },function(username, password, done) {

        // Match Username
        let query = { email: username }
        console.log(query)
        col_users.findOne(query, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { type: 'danger', message: 'No user found' });
            }
            
            if (!user.active) {
                return done(null, false, { type: 'danger', message: 'User is not active!! Please contact admin for activation' });
            }

            // Match Password
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    console.log('Authenticated');
                    return done(null, user);
                } else {
                    console.log('Not Authenticated');
                    return done(null, false, { type: 'danger', message: 'Wrong password' });
                }
            });
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        if (id) {
            var o_id = new ObjectId(id);
            col_users.findOne({ _id: o_id }, function(err, user) {
                done(err, user);
            });
        }
    });
}