const express = require('express');
const router = express.Router();
const Room = require('../models/Rooms');

//Get all available rooms.
router.get('/', (req, res) => {
    Room
        .find()
        .sort({creationDate: -1})
        .then(rooms => res.json({rooms: rooms}))
        .catch(err => res.json(err));
})

//Create new room.
router.post('/', (req, res) => {
    const {name, host} = req.body;

    //Check if request is valid.
    if(!name || !host) {
        return res.status(400).json({msg: 'Please enter all required fields.'});
    }

    Room.findOne({'name': name})
        .then(room => {
            if(room) return res.status(400).json({msg: 'Room with that name already exists.'});
            const newRoom = new Room({
                name, host
            });
            newRoom
                .save()
                .then(roomObj => {
                    if(!roomObj) return res.status(400).json({msg: 'Error at room creation.'});
                    return res.status(200).json({msg: 'Room created successfuly', room: roomObj})
                })
                .catch(err => {
                    console.log(err);
                })
        })
})

//Check if room is joinable
//Checks if room is not full yet and prevents joining if it is.
//Checks if game is already in progress and prevents joining if it is.
//Runs in Lobby.js
router.patch('/join/:name', (req, res) => {
    //Find corresponding room
    Room
        .findOne({name: req.params.name})
        .then(room => {
            //Room with that name was not found.
            if(!room) return res.status(404).json({msg: 'Room does not exist.'});
            //Check if room is not full yet.
            if(room.playerCount > 3) return res.status(400).json({msg: 'Room is already full.'})
            if(room.gameInProgress) return res.status(400).json({msg: 'Game already in progress'})
            return res.status(200).json({msg: 'User has successfuly joined the room.'});
        })
        .catch(err => {
            console.log(err);
        })
})

//Delete room.
//Deletes room acording to id.
router.delete('/:id', (req, res) => {
    Room.findById(req.params.id)
        .then(room => room.remove().then(() => res.json({success: true})));
})

module.exports = router;