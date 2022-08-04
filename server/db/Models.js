const mongoose = require('mongoose');

const Users = mongoose.model('User', new mongoose.Schema({
    id: String,
    ip: String,
}));

const Ratelimits = mongoose.model('Ratelimit', new mongoose.Schema({
    ip: String,
    registration: Number,
}));

module.exports = { Users, Ratelimits };