const Rooms = require('../models/Rooms');

function addClientToRoom(client) {
    Rooms
        .findOne({name: client.room})
        .then(room => {
            if(!room) {
                console.log(`addUserToRoom {404} room {${client.room}} does not exist.`);
                return;
            }
            const newPlayerCount = room.playerCount + 1;
            if(newPlayerCount > 4) {
                console.log(`addUserToRoom {400} room {${client.room}} is full.`);
                return;
            }
            Rooms
                .updateOne({_id: room._id}, {$set: {playerCount: newPlayerCount}, $push: {players: client.user}})
                .then()
                .catch(err => console.log(err))
        })
        .catch(err => {
            console.log(err);
        });
}

exports.addClientToRoom = addClientToRoom;

function removeClientFromRoom(client) {
    Rooms
        .findOne({name: client.room})
        .then(room => {
            if(!room) {
                console.log(`removeUserFromRoom {404} room {${client.room}} does not exist.`);
                return;
            }
            const newPlayerCount = room.playerCount - 1;
            if(newPlayerCount > 0) { //Remove user and adjust player count.
                const newPlayers = room.players.filter(player => player !== client.user); //Returns all players except quitting user.
                Rooms
                    .updateOne({_id: room._id}, {$set: {playerCount: newPlayerCount, players: newPlayers}})
                    .then()
                    .catch(err => console.log(err));
            }
            else { //Room is empty, delete room.
                room.remove().then(() => console.log(`Room removed "${room.name}".`));
            }
        })
}

exports.removeClientFromRoom = removeClientFromRoom;