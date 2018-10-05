const self = this;
const methods = {};

const util = require('./util/user');


methods.setup = function(sessionDurationInMinutes, mongoose, app, UserModel) {
    self.sessionDurationInMinutes = sessionDurationInMinutes;
    self.User = util.prepUserModel(mongoose, UserModel);

    const setupApi = require('./api/user');
    setupApi(app, self.sessionDurationInMinutes, self.User);
};

methods.initialize = function() {
    return function(req, res, next) {
        const now = new Date();
        const sessionExpiration = new Date();
        sessionExpiration.setMinutes(sessionExpiration.getMinutes() + self.sessionDurationInMinutes);
        self.User.findOneAndUpdate({sessionid: req.headers.sessionid, sessionExpiration: {$gt: now}}, {$set: {sessionExpiration}}, {new: true}, function(err, result) {
            if(err || !result) {
                return res.status(400).json({error: 'Authentication failed'});
            }
            req.user = result;
            next();
        });
    }
};
// NOTE: avoid camelcase headers, apparently they get converted to lower case when fetched off of req.headers

module.exports = methods;