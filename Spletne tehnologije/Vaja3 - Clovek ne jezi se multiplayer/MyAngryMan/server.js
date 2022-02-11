const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketio = require('socket.io');
require('dotenv/config');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

//Routes
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const roomsRoute = require('./routes/rooms');
const roomUtils = require('./utils/roomUtils');

app.use('/users', usersRoute);
app.use('/auth', authRoute);
app.use('/rooms', roomsRoute);

//Connect to db
mongoose.connect(process.env.DB_CONNECTION,  {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('DB connected.');
});

allClients = [];
var statusReportIntervals = [];
MIN_PLAYER_COUNT = 4;
io.on('connection', socket => {
    //Join the user to specific room.
    socket.on('joinRoom', ({room, user}) => {
        //console.log(`${user} joined room "${room}"`);
        socket.join(room);
        let client = {socket: socket.id, room, user, ready: false};
        roomUtils.addClientToRoom(client);
        allClients.push(client);

        //Setup status report interval function.
        let roomInfo = roomUtils.getRoomInfo(room);
        if(roomInfo.clients.length === 1) {
            let statusReportInterval = setInterval(function() {
                io.to(roomInfo.name).emit('statusMessage', returnRoomStatusMsg(roomInfo));
            }, 5000)
            statusReportIntervals.push({'room': roomInfo.name, 'interval': statusReportInterval});
        }
    });

    socket.on('toggleReady', ({room, user}) => {
        let usersReady = roomUtils.userToggleReady(room, user);
        if(usersReady.length === MIN_PLAYER_COUNT) {
            //GAME START           
            let currRoom = roomUtils.startNewGame(room);
            //Inform who is which color and put game in progress.
            io.to(room).emit('gameInProgress', usersReady);
            //Send starting positions. Inform who's turn it is.
            io.to(room).emit('refreshState', currRoom.gameInfo)
            //Allow turn to the player on turn.
            let idxOnTurn = currRoom.gameInfo.onTurn;
            let usernameOnTurn = currRoom.gameInfo.players[idxOnTurn];
            let clientOnTurn = roomUtils.getClientByUsername(room, usernameOnTurn);
            io.to(clientOnTurn.socket).emit('allowTurn');
        }
    })

    socket.on('diceRoll', ({room, user}) => {
        let diceRoll = Math.floor(Math.random() * 6) + 1;
        io.to(room).emit('diceRoll', diceRoll);
        if(!roomUtils.checkForPossibleActions(room, diceRoll)) {
            //No possible actions for current dice roll.
            let clientOnTurn = roomUtils.getClientByUsername(room, user);
            io.to(clientOnTurn.socket).emit('errorMsg', `No possible actions for current dice roll (${diceRoll})`);
            if(roomUtils.checkIfEligibleForReroll(room)) {
                io.to(clientOnTurn.socket).emit('allowTurn');
                return
            }
            let gameInfo = roomUtils.skipTurn(room);
            io.to(room).emit('refreshState', gameInfo);
            let idxOnTurn = gameInfo.onTurn;
            let usernameOnTurn = gameInfo.players[idxOnTurn];
            let nextClientOnTurn = roomUtils.getClientByUsername(room, usernameOnTurn);
            io.to(nextClientOnTurn.socket).emit('allowTurn');
        }
    }) 

    socket.on('moveSelected', ({room, user, selectedCell, diceRoll}) => {
        let results = roomUtils.moveSelected(room, user, selectedCell, diceRoll);
        const {gameInfo, errorMsg} = results;
        if(errorMsg === "") {
            //Refresh positions in room.
            io.to(room).emit('refreshState', gameInfo);
            //Allow turn to the player on turn.
            let idxOnTurn = gameInfo.onTurn;
            let usernameOnTurn = gameInfo.players[idxOnTurn];
            let clientOnTurn = roomUtils.getClientByUsername(room, usernameOnTurn);
            if(gameInfo.finished.length < 3) { //Konec igre TODO statistika
                io.to(clientOnTurn.socket).emit('allowTurn');
            }
            else {
                console.log("GAME ENDED");
            }
        }
        else { //Send errorMsg to current player onTurn.
            let clientOnTurn = roomUtils.getClientByUsername(room, user);
            io.to(clientOnTurn.socket).emit('errorMsg', errorMsg);
            io.to(clientOnTurn.socket).emit('allowActionChange');
        }
    })
  
    //When client disconnects
    socket.on('disconnect', () => {
        const indexOf = allClients.indexOf({socket: socket.id});
        const client = allClients.splice(indexOf, 1)[0];
        const deleted = roomUtils.removeClientFromRoom(client);
        if(deleted) { //Remove status report interval.
            let indexOf = statusReportIntervals.indexOf({room: client.room});
            let spi = statusReportIntervals.splice(indexOf, 1);
            clearInterval(spi.interval);
        }
        allClients = allClients.filter(c => c !== client);
        //console.log(`${client.user} has left room "${client.room}.`);
    });
})

function returnRoomStatusMsg(roomInfo) {
    if (roomInfo.clients.length < 4) {
        return `Waiting for players... (${roomInfo.clients.length} / 4)`
    }
    else if (roomInfo.clients.length == 4 && !roomInfo.gameInProgress) {
        return `Game starting soon. Waiting for players to ready up... (${roomInfo.clients.length} / 4)`
    }
    else if(roomInfo.gameInProgress) {
        return 'Game in progress!'
    }
}
  

const port = 5000 || process.env.PORT;
server.listen(port);
console.log(`Server listening on port ${port}`);