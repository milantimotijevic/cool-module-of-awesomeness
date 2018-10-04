const methods = {};
const self = this;

const randomString = require('randomstring');

methods.setup = function(tokenDurationInMinutes, mongoose, app) {
    self.tokenDurationInMinutes = tokenDurationInMinutes;
    const Schema = mongoose.Schema;
    const userSchema = new Schema({
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: String,
        token: String,
        tokenExpiration: Date
    });
    self.User = mongoose.model('User', userSchema);

    app.post('/register', function(req, res, next) {
        const user = req.body;
        if(!user || !user.email || !user.password) {
            return res.status(400).json({message: 'Registration error. Either the user object was not provided, or it did not contain email/password properties'});
        }
        const newUser = new self.User(user);
        newUser.save(function(err, result) {
            if(err) {
                if(err.code === 11000) {
                    return res.status(400).json({message: 'Registration error. Email already in use'});
                }
                return next(err);
            }
            res.json({message: 'Registration successful'});
        });
    });

    app.post('/login', function(req, res, next) {
        const token = randomString.generate();
        const tokenExpiration = new Date();
        tokenExpiration.setMinutes(tokenExpiration.getMinutes() + self.tokenDurationInMinutes);
        self.User.findOneAndUpdate({email: req.body.email, password: req.body.password}, {$set: {token: token, tokenExpiration: tokenExpiration}, }, {new: true}, function(err, result) {
            if(err) next(err);
            if(!result) {
                return res.status(400).send({message: 'Error logging in. Invalid credentials'});
            }
            res.set('token', result.token);
            res.send({message: 'Login successful', token: result.token});
        });
    });
};

methods.initialize = function() {
    return function(req, res, next) {
        const now = new Date();
        const tokenExpiration = new Date();
        tokenExpiration.setMinutes(tokenExpiration.getMinutes() + self.tokenDurationInMinutes);
        self.User.findOneAndUpdate({token: req.headers.token, tokenExpiration: {$gt: now}}, {$set: {tokenExpiration}}, {new: true}, function(err, result) {
            if(err || !result) {
                return res.status(400).json({error: 'Authentication failed'});
            }
            req.user = result;
            next();
        });
    }
};


module.exports = methods;