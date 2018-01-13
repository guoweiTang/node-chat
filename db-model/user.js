/**
 * user model
 */
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    id: {
        type: String,
        rquired: true,
        index: true
    },
    name: {
        type: String,
        rquired: true
    },
    password: {
        type: String,
        rquired: true
    },
    picture: {
        type: String
    }
});
let userModel = mongoose.model('users', userSchema);

module.exports = userModel;