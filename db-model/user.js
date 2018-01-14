/**
 * user model
 */
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index: true
    },
    name: {
        type: String,
        unique: true,
        rquired: true
    },
    password: {
        type: String,
        rquired: true
    },
    picture: {
        type: String,
        default: '/upload-sources/i/default-head.jpg'
    }
});
let userModel = mongoose.model('users', userSchema);

module.exports = userModel;