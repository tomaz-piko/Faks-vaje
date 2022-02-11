const express = require('express');
const router = express.Router();

const List = require('../models/List');
const Task = require('../models/Task');
const ObjectID = require('mongodb').ObjectID;

//Get all lists
router.get('/', (req, res) => {
    List.find()
        .sort({date: -1})
        .populate('tasks')
        .then(lists => res.json(lists));
});

//Add new list
router.post('/', (req, res) => {
    const newList = new List({
        description: req.body.description
    });
    newList
        .save()
        .then(list => res.json(list));
});

//Update description of a list
router.patch('/:id', (req, res) => {
    List.updateOne(
        {_id: new ObjectID(req.params.id)}, {$set: {description: req.body.description}}
    ).then(doc => res.json(doc))
    .catch(err => res.json(err));
});

//Delete a task from list
router.patch('/:listId/task/:taskId', (req, res) => {
    List.findById(req.params.listId)
        .then(list => {
            const newTasks = list.tasks.filter(task => task !== req.params.taskId) //Vrne array taskov brez izbrisanega elementa.
            List.findOneAndUpdate(
                {_id: new ObjectID(req.params.listId)}, {$set: {tasks: newTasks}}, {new: true}) //Nastavi array taskov lista na novi array taskov.
            .populate('tasks')
            .then(updatedList => 
                res.json(updatedList))
            .catch(err => res.json(err));
        })
});

//Delete a list
router.delete('/:id', (req, res) => {
    List.findById(req.params.id)
        .then(list => {
            const {tasks} = list;
            tasks.forEach(taskId => {
                Task.findById(taskId)
                    .then(task => task.remove());
            });
            list.remove().then(() => res.json({success: true}))});
});

module.exports = router;