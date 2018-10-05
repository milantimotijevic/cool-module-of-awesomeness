const randomString = require('randomstring');

module.exports = function(app, sessionDurationInMinutes, User) {
    app.post('/register', function(req, res, next) {
        const user = req.body;
        if(!user || !user.username || !user.password) {
            return res.status(400).json({message: 'Registration error. Either the user object was not provided, or it did not contain username/password properties'});
        }
        const newUser = new User(user);
        newUser.save(function(err, result) {
            if(err) {
                if(err.code === 11000) {
                    return res.status(400).json({message: 'Registration error. Username already in use'});
                }
                return next(err);
            }
            res.json({message: 'Registration successful', username: result.toJSON().username});
        });
    });

    app.post('/login', function(req, res, next) {
        const sessionid = randomString.generate();
        const sessionExpiration = new Date();
        sessionExpiration.setMinutes(sessionExpiration.getMinutes() + sessionDurationInMinutes);
        User.findOneAndUpdate({username: req.body.username, password: req.body.password}, {$set: {sessionid: sessionid, sessionExpiration: sessionExpiration}, }, {new: true}, function(err, result) {
            if(err) next(err);
            if(!result) {
                return res.status(400).send({message: 'Error logging in. Invalid credentials'});
            }
            const sessionid = result.toJSON().sessionid;
            res.set('sessionid', sessionid);
            res.send({message: 'Login successful', sessionid: sessionid});
        });
    });
};