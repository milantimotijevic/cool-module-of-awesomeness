methods = {};

const mandatorySchemaProperties = {
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    sessionid: String,
    sessionExpiration: Date
};

methods.prepUserModel = function(mongoose, userModelName) {
    if(userModelName) {
        const User = mongoose.model(userModelName);
        User.schema.add(mandatorySchemaProperties);
        return User;
    }
    const Schema = mongoose.Schema;
    const userSchema = new Schema(mandatorySchemaProperties);

    return mongoose.model('User', userSchema);
};

module.exports = methods;

/*
NOTE: Adding properties to a schema after it has been consumed into a model will cause resulting objects (from fetches)
to NOT implicitly call toJSON(), meaning that some properties will not be available right off the bat (i.e. result.sessionid);
instead, you'll need to call .toJSON() manually
*/