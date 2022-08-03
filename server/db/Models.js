const mongoose = require('mongoose');

const Users = mongoose.model('User', new mongoose.Schema({
    id: String,
    ip: String,
}));

module.exports = { Users };