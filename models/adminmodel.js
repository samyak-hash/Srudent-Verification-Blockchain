const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdOn:{
        type:Date,
        default:Date.now()
    }
});

module.exports = new mongoose.model('admin', adminSchema);
