methods = {};

methods.prepUserModel = function(mongoose, UserModel) {
    if(UserModel) {
        UserModel.schema.add({
            email: {
                type: String,
                required: true,
                unique: true
            },
            password: String,
            token: String,
            tokenExpiration: Date
        });
        return UserModel;
    }
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

    return mongoose.model('User', userSchema);
};

module.exports = methods;

/*
NOTE: Adding properties to a schema after it has been consumed into a model will cause resulting objects (from fetches)
to NOT implicitly call toJSON(), meaning that some properties will not be available right off the bat (i.e. result.token);
instead, you'll need to call .toJSON() manually
*/