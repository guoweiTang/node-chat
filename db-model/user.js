/**
 * user model
 */
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    id: String,
    name: String,
    password: String,
    picture: String
});
let userModel = mongoose.model('users', userSchema);

module.exports = userModel;