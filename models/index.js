/**
 * define index.js
 * avatarUrl accoding to email
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/technode');
exports.User = mongoose.model('User',require('./user'));