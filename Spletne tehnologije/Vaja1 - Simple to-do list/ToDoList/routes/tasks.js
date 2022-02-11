const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const List = require('../models/List');
const ObjectID = require('mongodb').ObjectID;
const NumberLong = require('mongodb').Long;


//Get all tasks
router.get('/', (req, res) => {
    Task.find()
        .then(tasks => res.json(tasks));
});

//Get specific task by id
router.get('/:id', (req, res) => {
    Task.findById(req.params.id)
        .then(task => res.json(task));
});

//Add new task
router.post('/', (req, res) => {
    const { description, dueDate, listId, tags } = req.body;
    if(!description || !listId) {
        return res.status(400).json({msg: 'Request does not include all needed information.'});
    }
    const newTask = new Task({
        description,
        dueDate,
        tags
    });
    newTask
        .save()
        .then(task => {
            List.updateOne(
                {_id: listId}, {$push: {tasks: task._id}}
            ).then(() => res.json(task));           
        });
});

//Complete a task
router.patch('/complete/:id', (req, res) => {
    Task.findOneAndUpdate(
        {_id: new ObjectID(req.params.id)}, {$bit: {"completed": {xor: NumberLong(1)}}}, {new: true})
        .then(updatedTask => res.json(updatedTask))
        .catch(err => res.json(err)
    )
})

router.patch('/:id', (req, res) => {
    const {description, dueDate, tags} = req.body;
    Task.findOneAndUpdate(
            {_id: new ObjectID(req.params.id)}, 
            {$set: {description, dueDate, tags}},
            {new: true})
        .then(updatedTask => res.json(updatedTask))
        .catch(err => res.json(err)
    )
})

//Delete a task
router.delete('/:id', (req, res) => {
    Task.findById(req.params.id)
        .then(task => task.remove().then(() => res.json({success: true})));
})

module.exports = router;