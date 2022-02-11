const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        requred: true
    },
    completed: {
        type: Number,
        default: 0
    },
    tags: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Task', TaskSchema);