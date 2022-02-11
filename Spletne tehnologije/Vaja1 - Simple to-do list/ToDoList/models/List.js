const mongoose = require('mongoose');
const Task = require('./Task');

const ListSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Task,
        default: []
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('List', ListSchema);