const roomDbUtils = require('./roomDbUtils');

let rooms = [];
let colors = ['blue', 'red', 'green', 'yellow'];
let homeCells = {
    blue: [0, 1, 11, 12],
    red: [9, 10, 20, 21],
    green: [108, 109, 119, 120],
    yellow: [99, 100, 110, 111]
}
let paths = {
    blue: [44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 56, 57, 58, 59],
    red: [6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 16, 27, 38, 49],
    green: [76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 64, 63, 62, 61],
    yellow: [114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 104, 93, 82, 71]
}
let endCells = {
    blue: [56, 57, 58, 59],
    red: [16, 27, 38, 49],
    green: [64, 63, 62, 61],
    yellow: [104, 93, 82, 71]
}

function addClientToRoom(client) {
    let roomIdx = findRoomIdx(client.room);
    if(roomIdx !== -1) { //Room already exists, join user to room.
        const currClients = rooms[roomIdx].clients;
        rooms[roomIdx].clients = [...currClients, client];
    }
    else { //Room doesn't exist, create new room.
        let newRoom = {
            name: client.room,
            clients: [{...client}], //Add first user to room.
            usersReady: [],
            gameInProgress: false,
            gameInfo: {
                onTurn: 0,
                consecutiveRolls: 0,
                players: [],
                finished: [],
                positions: {
                    blue: [],
                    red: [],
                    green: [],
                    yellow: []
                }
            }
        }
        rooms.push(newRoom);
    }
    roomDbUtils.addClientToRoom(client);
}

exports.addClientToRoom = addClientToRoom;

function removeClientFromRoom(client) {
    let roomIdx = findRoomIdx(client.room);
    if(roomIdx !== -1) {
        roomDbUtils.removeClientFromRoom(client);
        rooms[roomIdx].clients = rooms[roomIdx].clients.filter(c => c.user !== client.user);
        if(rooms[roomIdx].clients.length === 0) { //Room got deleted.
            return true;
        }
        return false;
    }
    return false;
}

exports.removeClientFromRoom = removeClientFromRoom;

function findRoomIdx(room) {
    for(let i = 0; i < rooms.length; i++) {
        if(rooms[i].name === room) {
            return i;
        }
    }
    return -1;
}

function getRoomInfo(room) {
    for(let i = 0; i < rooms.length; i++) {
        if(rooms[i].name === room) {
            return rooms[i];
        }
    }
    return -1;
}

exports.getRoomInfo = getRoomInfo;

function userToggleReady(room, user) {
    let roomIdx = findRoomIdx(room);
    if(rooms[roomIdx].usersReady.includes(user)) { //Remove from ready players.
        rooms[roomIdx].usersReady = rooms[roomIdx].usersReady.filter(u => u !== user)
    }
    else { //Add to ready players.
        rooms[roomIdx].usersReady.push(user);
    }
    return rooms[roomIdx].usersReady
}

exports.userToggleReady = userToggleReady;

function startNewGame(room) {
    let roomIdx = findRoomIdx(room);
    rooms[roomIdx].gameInProgress = true;
    rooms[roomIdx].gameInfo = {
        onTurn: 0,
        consecutiveRolls: 0,
        players: rooms[roomIdx].usersReady,
        finished: [],
        positions: {
            blue: [0, 1, 11, 12],
            red: [9, 10, 20, 21],
            green: [108, 109, 119, 120],
            yellow: [99, 100, 110, 111]
        }
    }
    return rooms[roomIdx];
}

exports.startNewGame = startNewGame;

function moveSelected(room, user, selectedCell, diceRoll) {
    let errorMsg = "";
    let roomIdx = findRoomIdx(room);
    let playerOnTurn = rooms[roomIdx].gameInfo.onTurn;
    let currPlayer = colors[playerOnTurn]; //red
    let otherPlayers = colors.filter(c => c !== currPlayer); //blue, green, yellow
    let tmpPositions = rooms[roomIdx].gameInfo.positions[currPlayer].filter(pos => pos != selectedCell);
    if (homeCells[currPlayer].includes(selectedCell)) { //Tries seting new figure on board.
        if(diceRoll == 6) {
            let newPos = paths[currPlayer][0];
            if(rooms[roomIdx].gameInfo.positions[currPlayer].includes(newPos)){ //Position already occupied by same color figure. Action invalid
                errorMsg = "Position already occupied by same color figure.";
            }
            else {
                //Check if position already occupied by different color figure. Do overtake.
                checkForOpponentOvertake(roomIdx, otherPlayers, newPos);
                tmpPositions.push(paths[currPlayer][0]);
                rooms[roomIdx].gameInfo.positions[currPlayer] = tmpPositions; //Update room gameInfo.
            }
        }
        else { //Dice roll != 6, can't set new figure. Action Invalid.
            errorMsg = "Dice roll of 6 is needed to set new figure."
        }
    }
    else {  //Tries moving selected figure.
        let currIdx = paths[currPlayer].indexOf(selectedCell);
        let newIdx = currIdx + diceRoll;
        if(newIdx >= paths[currPlayer].length) { //Out of bounds, roll too high. Action invalid
            errorMsg = "New position is out of bounds."
        }
        else {
            let newPos = paths[currPlayer][currIdx + diceRoll];
            if(rooms[roomIdx].gameInfo.positions[currPlayer].includes(newPos)) { //Position already occupied by same color figure. Action invalid
                errorMsg = "Position already occupied by same color figure."
            }
            else { //Check if position already occupied by different color figure. Do overtake if needed and move figure.
                checkForOpponentOvertake(roomIdx, otherPlayers, newPos);
                tmpPositions.push(paths[currPlayer][currIdx + diceRoll]);
                rooms[roomIdx].gameInfo.positions[currPlayer] = tmpPositions; //Update room gameInfo.
            }
        }    
    }
    
    //If action was successful. Switch player on turn.
    if(errorMsg === "") {
        //Check for win condition.
        rooms[roomIdx].gameInfo.consecutiveRolls = 0;
        checkForWinCondition(roomIdx);
        if(diceRoll !== 6) {
            setNextPlayerOnTurn(roomIdx);
        }
    }
    
    return {'gameInfo': rooms[roomIdx].gameInfo, 'errorMsg': errorMsg};
}

exports.moveSelected = moveSelected;

function checkForOpponentOvertake(roomIdx, otherPlayers, newPos) {
    otherPlayers.forEach(playerColor => {
        if(rooms[roomIdx].gameInfo.positions[playerColor].includes(newPos)) {
            //Find unoccupied home tile.
            let playerHomeCells = homeCells[playerColor];
            let playerCurrPositions = rooms[roomIdx].gameInfo.positions[playerColor];
            let unoccupiedHomeCells = playerHomeCells.filter(cell => !playerCurrPositions.includes(cell));
            //return overtaken figure back to home.
            const idx = rooms[roomIdx].gameInfo.positions[playerColor].indexOf(newPos);
            rooms[roomIdx].gameInfo.positions[playerColor].splice(idx, 1);
            rooms[roomIdx].gameInfo.positions[playerColor].push(unoccupiedHomeCells[0]);
            return //Only one player can occupy one position so further searching is redundant.
        }
    })
}

function checkForWinCondition(roomIdx) {
    let onTurnIdx = rooms[roomIdx].gameInfo.onTurn;
    let currPlayerName = rooms[roomIdx].gameInfo.players[onTurnIdx];
    let currPlayerColor = colors[onTurnIdx]; 
    let figuresInEndZone = rooms[roomIdx].gameInfo.positions[currPlayerColor].filter(position => endCells[currPlayerColor].includes(position));
    if(figuresInEndZone.length === 4) { //Finished.
        rooms[roomIdx].gameInfo.finished.push(currPlayerName);
    }
}

function checkForPossibleActions(room, diceRoll) {
    let roomIdx = findRoomIdx(room);
    let playerOnTurn = rooms[roomIdx].gameInfo.onTurn;
    let currPlayer = colors[playerOnTurn];
    if(diceRoll === 6) { //Check if he can place new figure.
        let newPos = paths[currPlayer][0];
        if(!rooms[roomIdx].gameInfo.positions[currPlayer].includes(newPos)){ //Starting position not yet occupied.
            return true
        }
    }
    //Check for every other figure
    let figuresOnField = rooms[roomIdx].gameInfo.positions[currPlayer].filter(position => !homeCells[currPlayer].includes(position)); //Filter figures that arent in homeCells.
    for(let i = 0; i < figuresOnField.length; i++) {
        let figure = figuresOnField[i];
        let currIdx = paths[currPlayer].indexOf(figure);
        let newIdx = currIdx + diceRoll;
        if(newIdx < paths[currPlayer].length) { //Out of bounds, roll too high. Action invalid
            let newPos = paths[currPlayer][currIdx + diceRoll];
            if(!rooms[roomIdx].gameInfo.positions[currPlayer].includes(newPos)) { //If position isnt occupied by same color.
                return true
            }
        }
    }
    return false
}

function setNextPlayerOnTurn(roomIdx) {
    let playerOnTurn = rooms[roomIdx].gameInfo.onTurn;
    do {
        playerOnTurn = (playerOnTurn + 1) % rooms[roomIdx].gameInfo.players.length;
    }while(rooms[roomIdx].gameInfo.finished.includes(rooms[roomIdx].gameInfo.players[playerOnTurn]))
    rooms[roomIdx].gameInfo.onTurn = playerOnTurn;
}

exports.checkForPossibleActions = checkForPossibleActions;

function skipTurn(room) {
    let roomIdx = findRoomIdx(room);
    setNextPlayerOnTurn(roomIdx);
    return rooms[roomIdx].gameInfo;
}

exports.skipTurn = skipTurn;

function checkIfEligibleForReroll(room) {
    let roomIdx = findRoomIdx(room);
    if(rooms[roomIdx].gameInfo.consecutiveRolls === 2) {
        rooms[roomIdx].gameInfo.consecutiveRolls = 0;
        return false
    }
    let playerOnTurn = rooms[roomIdx].gameInfo.onTurn;
    let currPlayerColor = colors[playerOnTurn];
    let currPlayerPositions = rooms[roomIdx].gameInfo.positions[currPlayerColor];
    let figuresInStartZone = currPlayerPositions.filter(position => homeCells[currPlayerColor].includes(position));
    if(figuresInStartZone.length === 4) { //All figures in start zone.
        rooms[roomIdx].gameInfo.consecutiveRolls += 1;
        return true
    }
    /*let figuresInEndZone = currPlayerPositions.filter(position => endCells[currPlayerColor].includes(position)); //Find all figures in end zone.
    if(figuresInStartZone.length + figuresInEndZone.length === 4) { //Check if figures are all the way in the end zone.
        let endZone = endCells[currPlayerColor];
        for(let i = 0; i < figuresInEndZone.length; i++) {
            if(!figuresInEndZone.includes(endZone[endZone.length - (i+1)])) {
                return false
            }
        }
        rooms[roomIdx].gameInfo.consecutiveRolls += 1;
        return true
    }*/
}

exports.checkIfEligibleForReroll = checkIfEligibleForReroll;

function getClientByUsername(room, user) {
    let roomIdx = findRoomIdx(room);
    let client = rooms[roomIdx].clients.filter(client => client.user === user)[0];
    return client;
}

exports.getClientByUsername = getClientByUsername;