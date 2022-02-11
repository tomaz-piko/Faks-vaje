let rows = 3;
let cols = 8;
let startingTokenCount = 6;

let player1TokenCount = startingTokenCount;
let player1TokenPositions = [];
let player1AI = null;
let player2TokenCount = startingTokenCount;
let player2TokenPositions = [];
let player2AI = null;

let p1Path = [3, 2, 1, 0, 8, 9, 10, 11, 12, 13, 14, 15, 7, 6];
let p2Path = [19, 18, 17, 16, 8, 9, 10, 11, 12, 13, 14, 15, 23, 22];
let positionIds = [];

const rosetas = [0, 7, 11, 16, 23];
let PLAYER_ON_TURN = 1;
let DICE_ROLL = -1;
let ACTION = null;
let SELECTED_TOKEN = null;
let LANDED_ON_ROSETA = false;

let diceRollProbabilites = [1/16, 1/4, 3/8, 1/4, 1/16];

function getNumFromId(id) {
    let from = id.indexOf('i') + 1;
    let to = id.indexOf('j');
    let end = id.length;
    let i = id.substring(from, to);
    let j = id.substring(to + 1, end);
    return (parseInt(i) * cols) + parseInt(j)
}

function selectToken() {
    let num = getNumFromId(this.id);
    if(PLAYER_ON_TURN == 1) {
        if (!player1TokenPositions.includes(num)) {return;}
        SELECTED_TOKEN = num;
    }
    else if(PLAYER_ON_TURN == 2) {
        if (!player2TokenPositions.includes(num)) {return;}
        SELECTED_TOKEN = num;
    }
}

function refreshPlayerTilesBoard() {
    //player1Tiles, player2Tiles
    let p1Tiles = document.getElementById('player1Tiles');
    p1Tiles.deleteRow(0);
    let newRow1 = p1Tiles.insertRow();

    let p2Tiles = document.getElementById('player2Tiles');
    p2Tiles.deleteRow(0);
    let newRow2 = p2Tiles.insertRow();
    for(let i = 0; i < player1TokenCount - player1TokenPositions.length; i++) {
        let cell = newRow1.insertCell();
        cell.innerHTML = '<img src="./icons/p1.png" class="tokenImage" />'
    }
    for(let i = 0; i < player2TokenCount - player2TokenPositions.length; i++) {
        let cell = newRow2.insertCell();
        cell.innerHTML = '<img src="./icons/p2.png" class="tokenImage"/>'
    }
}

function setBoard() {
    let blanks = [4, 5, 20, 21];
    const board = document.getElementById('gameBoard');
    for (let i = 0; i < rows; i++) {
        let row = board.insertRow();
        for (let j = 0; j < cols; j++) {
            let cell = row.insertCell();
            let cellNum = (i*cols) + j;
            let cellId = "i" + i + "j" + j; 
            positionIds.push(cellId);
            cell.id = cellId; 
            cell.addEventListener("click", selectToken);
            if(blanks.includes(cellNum)) {
                cell.classList.add('blank');
            }
            else if(rosetas.includes(cellNum)) {
                cell.classList.add('roseta');
            }
            else if (i == 1) {
                cell.classList.add('warZone');
            }   
            else {
                cell.classList.add('blue');
            }
        }
    }
}

function refreshBoard() {
    positionIds.forEach(id => {
        let cell = document.getElementById(id);
        cell.innerHTML = '';
    })
    player1TokenPositions.forEach(tokenPos => {
        let cell = document.getElementById(positionIds[tokenPos]);
        cell.innerHTML = '<img src="./icons/p1.png" class="tokenImage" />';
    })
    player2TokenPositions.forEach(tokenPos => {
        let cell = document.getElementById(positionIds[tokenPos]);
        cell.innerHTML = '<img src="./icons/p2.png" class="tokenImage" />';
    })
    refreshPlayerTilesBoard();
}

function rollDice() {
    if(DICE_ROLL > -1) {
        return;
    }
    let diceCount = 4
    let result = []
    for (let i = 0; i < diceCount; i++) {
        result.push(Math.round(Math.random()));
    }
    let roll = result.reduce((a, b) => a + b, 0)
    //alert("Dice roll: " + roll);
    DICE_ROLL = roll;
}

function setAction(action) {
    //TODO preverjanja
    ACTION = action;
}

function placeNewToken() {
    let newPos = -1;
    if (PLAYER_ON_TURN == 1) {
        if(player1TokenCount - player1TokenPositions.length == 0) {
            alert("All token already on board...");
            return false;
        }
        newPos = p1Path[DICE_ROLL - 1]
        if(player1TokenPositions.includes(newPos)) {//Igralec že ima zasedeno to mesto na igralni plošči.
            alert("Position already occupied...");
            return false
        }
        player1TokenPositions.push(newPos);
    }
    else if (PLAYER_ON_TURN == 2) {
        if(player2TokenCount - player2TokenPositions.length == 0) {
            alert("All token already on board...");
            return false;
        }
        newPos = p2Path[DICE_ROLL - 1]
        if(player2TokenPositions.includes(newPos)) {//Igralec že ima zasedeno to mesto na igralni plošči.
            alert("Position already occupied...");
            return false
        }
        player2TokenPositions.push(newPos);
    }
    if(rosetas.includes(newPos)) {
        LANDED_ON_ROSETA = true;
    }
    refreshBoard();
    return true
}

function moveSelectedToken() {
    //Primer
    //p1TokenPositions = [1]
    //p1Path = [3, 2, 1, 0, 8, 9, 10, 11, 12, 13, 14, 15, 7, 6];
    let newPos = -1;
    if(PLAYER_ON_TURN == 1) {       
        let currPathIdx = p1Path.indexOf(SELECTED_TOKEN); //Vrne 2 (položaj elementa 1 v p1Path)
        if((currPathIdx + DICE_ROLL) == p1Path.length) { //Token pride do konca.
            console.log('Player 1\'s token finished.');
            player1TokenCount--;
            let removeIdx = player1TokenPositions.indexOf(SELECTED_TOKEN); //1
            player1TokenPositions.splice(removeIdx, 1); //Odstranimo token iz p1Tokens
            refreshBoard();
            return true
        }
        else if((currPathIdx + DICE_ROLL) >= p1Path.length) { //Met kocke je preveč za zaključek.
            //TODO CALC how many you need
            alert("Can not move that token...");
            return false
        }
        else {
            newPos = p1Path[currPathIdx + DICE_ROLL];
            if(player1TokenPositions.includes(newPos)) {//Igralec že ima zasedeno to mesto na igralni plošči.
                alert("Position already occupied...");
                return false
            }
            else if(player2TokenPositions.includes(newPos)) {//Nasprotnik ima zasedeno polje, zato ga odstranimo.
                if(newPos == 11) { //Glavna rozeta.
                    alert("Can not overtake on roseta...");
                    return false
                }
                let p2Idx = player2TokenPositions.indexOf(newPos);
                player2TokenPositions.splice(p2Idx, 1);
            }
            let removeIdx = player1TokenPositions.indexOf(SELECTED_TOKEN); //1
            player1TokenPositions.splice(removeIdx, 1); //Odstranimo token iz p1Tokens
            player1TokenPositions.push(newPos);
        }       
    }
    else if(PLAYER_ON_TURN == 2) {
        let currPathIdx = p2Path.indexOf(SELECTED_TOKEN); //Vrne 2 (položaj elementa 1 v p1Path)
        if((currPathIdx + DICE_ROLL) == p1Path.length) {
            console.log('Player 2\'s token finished.');
            player2TokenCount--;
            let removeIdx = player2TokenPositions.indexOf(SELECTED_TOKEN); //1
            player2TokenPositions.splice(removeIdx, 1); //Odstranimo token iz p1Tokens
            refreshBoard();
            return true
        }
        else if((currPathIdx + DICE_ROLL) >= p1Path.length) {
            //TODO CALC how many you need
            alert("Can not move that token...");
            return false
        }
        else {
            newPos = p2Path[currPathIdx + DICE_ROLL];
            if(player2TokenPositions.includes(newPos)) {//Igralec že ima zasedeno to mesto na igralni plošči.
                alert("Position already occupied...");
                return false
            }
            else if(player1TokenPositions.includes(newPos)) {//Nasprotnik ima zasedeno polje, zato ga odstranimo.
                if(newPos == 11) { //Glavna rozeta.
                    alert("Can not overtake on roseta...");
                    return false
                }
                let p1Idx = player1TokenPositions.indexOf(newPos);
                player1TokenPositions.splice(p1Idx, 1);
            }
            let removeIdx = player2TokenPositions.indexOf(SELECTED_TOKEN); //1
            player2TokenPositions.splice(removeIdx, 1); //Odstranimo token iz p1Tokens
            player2TokenPositions.push(newPos);
        }        
    }
    if(rosetas.includes(newPos)) {
        console.log('ROSETA');
        LANDED_ON_ROSETA = true;
    }
    refreshBoard();
    return true
}

function setStatus(s) {
    document.getElementById('statusText').innerHTML = s;
}

function setDiceText() {
    document.getElementById('diceRollText').innerHTML = "Current dice roll: " + DICE_ROLL;
}

function checkIfActionPossible() {
    //TODO
    let result = false
    if(PLAYER_ON_TURN == 1) {
        if(player1TokenCount - player1TokenPositions.length > 0) { //Preveri če lahko postavi nov token na board.
            if(!player1TokenPositions.includes(p1Path[DICE_ROLL - 1])) {
                return true
            }
        }
        player1TokenPositions.forEach(tokenPos => { //Preveri če lahko premakne katerega koli od tokenov že na boardo.
            let currPathIdx = p1Path.indexOf(tokenPos);
            if ((currPathIdx + DICE_ROLL) == p1Path.length) { //Pride do konca
                result = true
            }
            else if ((currPathIdx + DICE_ROLL) >= p1Path.length) { //Preveč za konec, glej naslednji token
                return;
            }
            else if (player1TokenPositions.includes(p1Path[currPathIdx + DICE_ROLL])) { //Pozicija zasedena... glej naprej.
                return;
            }
            else if (p1Path[currPathIdx + DICE_ROLL] == 11) { //Če pristane na rozeti preveri da ni zasedena s strani nasprotnika.
                if(!player2TokenPositions.includes(11)) {
                    result = true
                }
            }
            else {
                result = true
            }
        })
    }
    else if(PLAYER_ON_TURN == 2) {
        if(player2TokenCount - player2TokenPositions.length > 0) { //Preveri če lahko postavi nov token na board.
            if(!player2TokenPositions.includes(p2Path[DICE_ROLL - 1])) {
                return true
            }
        }
        player2TokenPositions.forEach(tokenPos => { //Preveri če lahko premakne katerega koli od tokenov že na boardo.
            let currPathIdx = p2Path.indexOf(tokenPos);
            if ((currPathIdx + DICE_ROLL) == p2Path.length) { //Pride do konca
                result = true
            }
            else if ((currPathIdx + DICE_ROLL) >= p2Path.length) { //Preveč za konec, glej naslednji token
                return;
            }
            else if (player2TokenPositions.includes(p2Path[currPathIdx + DICE_ROLL])) { //Pozicija zasedena... glej naprej.
                return;
            }
            else if (p2Path[currPathIdx + DICE_ROLL] == 11) { //Če pristane na rozeti preveri da ni zasedena s strani nasprotnika.
                if(!player1TokenPositions.includes(11)) {
                    result = true
                }
            }
            else {
                result = true
            }
        })
    }
    return result
}

let aiIntervals = []

function restartGame() {
    aiIntervals.forEach(interval => {
        clearInterval(interval);
    });
    player1TokenCount = startingTokenCount;
    player1TokenPositions = [];
    player2TokenCount = startingTokenCount;
    player2TokenPositions = [];
    positionIds = [];
    PLAYER_ON_TURN = 1;
    DICE_ROLL = -1;
    ACTION = null;
    SELECTED_TOKEN = null;
    LANDED_ON_ROSETA = false;
    let gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = "";
    setBoard();
    refreshPlayerTilesBoard();
    let AI1 = document.getElementById("p1ModeSelectInput").value;
    let AI2 = document.getElementById("p2ModeSelectInput").value;
    if (AI1 == "HUMAN") {
        player1AI = null;
    }
    else {
        player1AI = AI1
    }
    if (AI2 == "HUMAN") {
        player2AI = null;     
    }
    else {
        player2AI = AI2;
        //TODO setINTERVAL()
    }
    let aiInterval = setInterval(aiDecisionLoop, 1500);
    aiIntervals.push(aiInterval);
}

function gameLoop() {
    setDiceText();
    if(DICE_ROLL == -1) { //Wait for dice roll...
        setStatus("Player " + PLAYER_ON_TURN + "'s turn... Waiting for dice roll.");
        return
    }
    if(DICE_ROLL == 0) { //Rolled 0... switch player on turn.
        PLAYER_ON_TURN = (PLAYER_ON_TURN == 1) ? 2 : 1;
        DICE_ROLL = -1;
        return
    }
    if(!checkIfActionPossible()) {
        alert("No possible actions");
        PLAYER_ON_TURN = (PLAYER_ON_TURN == 1) ? 2 : 1;
        DICE_ROLL = -1;
        return
    }
    if(ACTION == null) { //Wait for action select
        setStatus("Player " + PLAYER_ON_TURN + "'s turn... Waiting for action select.");
        return
    } //If dice rolled and action selected play out round...
    else if (ACTION == 'place_new') {
        if(!placeNewToken()) {
            ACTION = null;
            return
        }
    }
    else if (ACTION == 'move_selected') {
        if(SELECTED_TOKEN == null) {
            alert("No token selected.");
            ACTION = null;
            return
        }
        if(!moveSelectedToken()) {
            ACTION = null;
            return
        } 
    }
    //Player that landed on roseta, gets another turn.
    if(LANDED_ON_ROSETA == false) {
        PLAYER_ON_TURN = (PLAYER_ON_TURN == 1) ? 2 : 1;
    }
    LANDED_ON_ROSETA = false;
    DICE_ROLL = -1;
    ACTION = null;
    SELECTED_TOKEN = null;
    if(player1TokenCount == 0) {
        aiIntervals.forEach(interval => {
            clearInterval(interval);
        });
        alert("PLAYER 1 WINS");
    }
    else if(player2TokenCount == 0) {
        aiIntervals.forEach(interval => {
            clearInterval(interval);
        });
        alert("PLAYER 2 WINS");
    }
}

setBoard();
refreshPlayerTilesBoard();
setInterval(gameLoop, 500);

//BOT ACTIONS
function aiDecisionLoop() {
    if (PLAYER_ON_TURN == 1 && player1AI != null) {
        if(DICE_ROLL == -1) {
            rollDice();
        }
        if(DICE_ROLL == 0) {
            return
        }
        aiMakeDecision(player1AI);
    }
    else if (PLAYER_ON_TURN == 2 && player2AI != null) {
        if(DICE_ROLL == -1) {
            rollDice();
        }
        if(DICE_ROLL == 0) {
            return
        }
        console.log("Ai dice roll: " + DICE_ROLL);
        aiMakeDecision(player2AI);
    }
}

function aiMakeDecision(strategy) {
    //Preveri možne akcije glede na trenutni DICE ROLL
    let possibleActions = aiGetPossibleActions();
    if(possibleActions.length == 0) {
        return
    }
    aiSelectAction(possibleActions, strategy);
}

function aiGetPossibleActions() {
    /*
    action = {'action': 'action_description',
                'selected_token': 'token_idx',
                'priority': 'priority',
                'overtake': 'true_if_overtakes_opponent'}
    */
    let possibleActions = []
    if (PLAYER_ON_TURN == 1) {
        //Prvo preveri možno novo postavitev
        if (player1TokenCount - player1TokenPositions.length > 0) {
            if(!player1TokenPositions.includes(p1Path[DICE_ROLL-1])) { //Safe zone => probability = 0
                let action = {'action': 'place_new', 'selected_token': null, 'priority': 0, 'overtake': false};
                possibleActions.push(action);
            }
        }        
        //Preveri vse možne premike
        player1TokenPositions.forEach(tokenPos => {
            let currPathIdx = p1Path.indexOf(tokenPos);          
            if ((currPathIdx + DICE_ROLL) > p1Path.length) { //Preveč za konec.
                return;
            }
            else if (player1TokenPositions.includes(p1Path[currPathIdx + DICE_ROLL])) { //Pozicija zasedena.
                return;
            }
            else if(rosetas.includes(p1Path[currPathIdx + DICE_ROLL])) { //Premik na rozeto
                //Glavna rozeta ima večjo prioriteto.
                if(p1Path[currPathIdx + DICE_ROLL] == 11) {
                    if(player2TokenPositions.includes(11)) { //Rozeta zasedena
                        return;
                    }
                    let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': -2, 'overtake': false};
                    possibleActions.push(action)
                }
                else {
                    let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': -1, 'overtake': false};
                    possibleActions.push(action)
                }
            }
            else if(p1Path[currPathIdx] == 11) {
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 999, 'overtake': false};
                possibleActions.push(action)
            }
            else if(player2TokenPositions.includes(p1Path[currPathIdx + DICE_ROLL])) { //Overtake Nasprotnika
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 0, 'overtake': true};
                possibleActions.push(action)
            }
            else if((currPathIdx) + DICE_ROLL >= p1Path.length - 2 && (currPathIdx) + DICE_ROLL <= p1Path.length) { //Končni safe zone = 0
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 0, 'overtake': false};
                possibleActions.push(action);
            }
            else {
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 0, 'overtake': false};
                possibleActions.push(action)
            }
        })
    }
    else if (PLAYER_ON_TURN == 2) {
        //Prvo preveri možno novo postavitev
        if (player2TokenCount - player2TokenPositions.length > 0) {
            if(!player2TokenPositions.includes(p2Path[DICE_ROLL-1])) {
                let action = {'action': 'place_new', 'selected_token': null, 'priority': 0, 'overtake': false};
                possibleActions.push(action);
            }
        }        
        //Preveri vse možne premike
        player2TokenPositions.forEach(tokenPos => {
            let currPathIdx = p2Path.indexOf(tokenPos);          
            if ((currPathIdx + DICE_ROLL) > p2Path.length) { //Preveč za konec.
                return;
            }
            else if (player2TokenPositions.includes(p2Path[currPathIdx + DICE_ROLL])) { //Pozicija zasedena.
                return;
            }
            else if(rosetas.includes(p2Path[currPathIdx + DICE_ROLL])) { //Premik na rozeto
                //Glavna rozeta ima večjo prioriteto.
                if(p2Path[currPathIdx + DICE_ROLL] == 11) {
                    if(player1TokenPositions.includes(11)) { //Rozeta zasedena
                        return;
                    }
                    let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': -2, 'overtake': false};
                    possibleActions.push(action)
                }
                else {
                    let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': -1, 'overtake': false};
                    possibleActions.push(action)
                }
            }
            else if(p2Path[currPathIdx] == 11) { //Ostani na rozeti!.
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 999, 'overtake': false};
                possibleActions.push(action)
            }
            else if(player1TokenPositions.includes(p2Path[currPathIdx + DICE_ROLL])) { //Overtake Nasprotnika
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 0, 'overtake': true};
                possibleActions.push(action)
            }
            else if((currPathIdx) + DICE_ROLL >= p2Path.length - 2 && (currPathIdx) + DICE_ROLL <= p2Path.length) { //Končni safe zone = 0
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 0, 'overtake': false};
                possibleActions.push(action);
            }
            else {
                let action = {'action': 'move_selected', 'selected_token': tokenPos, 'priority': 0, 'overtake': false};
                possibleActions.push(action)
            }
        })
    }
    return possibleActions
}

function aiSelectAction(possibleActions, strategy) {
    if (strategy == "RANDOM") {
        let max = possibleActions.length;
        let selectedActionIdx = Math.floor(Math.random() * max);
        let action = possibleActions[selectedActionIdx];
        if(action.selected_token != null) {
            SELECTED_TOKEN = action.selected_token;
        }
        setAction(action.action);
    }
    else if (strategy == "AGGRO") {
        let action = null;
        if(PLAYER_ON_TURN == 1) {
            calculateAgressiveActionProbabilities(possibleActions, DICE_ROLL, player1TokenPositions, p1Path, player2TokenPositions, p2Path)
            //Priority is replaced with probability
        }
        else if(PLAYER_ON_TURN == 2) {
            calculateAgressiveActionProbabilities(possibleActions, DICE_ROLL, player2TokenPositions, p2Path, player1TokenPositions, p1Path)
            //Priority is replaced with probability
        }
        action = possibleActions.reduce((a, b) => a.priority < b.priority ? b : a)
        console.log(possibleActions);
        if(action.selected_token != null) {
            SELECTED_TOKEN = action.selected_token;
        }
        setAction(action.action);
    }
    else if (strategy == "DEFENSIVE") {
        let action = null;
        if(PLAYER_ON_TURN == 1) {
            calculateDefensiveActionProbabilities(possibleActions, DICE_ROLL, player1TokenPositions, p1Path, player2TokenPositions, p2Path)
            //Priority is replaced with probability
        }
        else if(PLAYER_ON_TURN == 2) {
            calculateDefensiveActionProbabilities(possibleActions, DICE_ROLL, player2TokenPositions, p2Path, player1TokenPositions, p1Path)
            //Priority is replaced with probability            
        }
        action = possibleActions.reduce((a, b) => a.priority > b.priority ? b : a)
        if(action.selected_token != null) {
            SELECTED_TOKEN = action.selected_token;
        }
        setAction(action.action);
    }
    else if (strategy == "PACIFIST") {
        let action = null;
        let nonOvertakingActions = possibleActions.filter(action => action.overtake == false);
        if(nonOvertakingActions.length > 0) {
            action = nonOvertakingActions.reduce((a, b) => a.priority > b.priority ? b : a)
        }
        else {
            action = possibleActions.reduce((a, b) => a.priority > b.priority ? b : a)
        }
        if(action.selected_token != null) {
            SELECTED_TOKEN = action.selected_token;
        }
        setAction(action.action);        
    }
}

function calculateAgressiveActionProbabilities(possibleActions, diceRoll, myTokens, myPath, oppTokens, oppPath) {
    possibleActions.forEach(action => {
        let currStateMyTokens = [...myTokens];
        let currStateOppTokens = [...oppTokens];
        if(action.priority < 0) {
            action.priority *= -1;
        }
        if(action.priority >= 999) {
            action.priority = 0;
        }
        if(action.overtake == true) {
            action.priority = 999;
            return
        }
        let nextState = prepareNextState(action, diceRoll, currStateMyTokens, myPath, currStateOppTokens, oppPath);
        let overallProbability = 0;
        //Za vsak nasprotnikov žeton preveri kakšna je možnost, da ti odstrani žetone.
        nextState.myTokenIndexes.forEach(myToken => {
            let probabilities = [];
            let startingZone = [0, 1, 2, 3];
            if(startingZone.includes(myToken)) { //Potiska žetone naprej
                overallProbability += startingZone.indexOf(myToken) / 20;
            }
            nextState.oppTokenIndexes.forEach(oppToken => {
                let safeZone = [0, 1, 2, 3, 7, 12, 13];                
                if(safeZone.includes(oppToken)) {
                    return
                }
                let distance = oppToken - myToken;
                if(distance > 0 && distance <= 4) { //Razdalja med njima.
                    probabilities.push(diceRollProbabilites[distance])
                }
            })
            if (probabilities.length > 0){
                overallProbability += probabilities.reduce((a, b) => a*b, 1);
            }
        })
        action.priority += overallProbability;
    })
}

function calculateDefensiveActionProbabilities(possibleActions, diceRoll, myTokens, myPath, oppTokens, oppPath) {
    possibleActions.forEach(action => {
        let currStateMyTokens = [...myTokens];
        let currStateOppTokens = [...oppTokens];
        if(action.priority < 0) {
            return
        }
        if(action.priority >= 999) {
            return
        }
        let nextState = prepareNextState(action, diceRoll, currStateMyTokens, myPath, currStateOppTokens, oppPath);
        //Za vsak nasprotnikov žeton preveri kakšna je možnost, da ti odstrani žetone.
        let overallProbability = action.priority;
        nextState.oppTokenIndexes.forEach(oppToken => {
            let probabilities = [];
            nextState.myTokenIndexes.forEach(myToken => {
                let safeZone = [0, 1, 2, 3, 7, 12, 13];
                if(safeZone.includes(myToken)) {
                    return;
                }
                let distance = myToken - oppToken;
                if(distance > 0 && distance <= 4) { //Razdalja med njima.
                    probabilities.push(diceRollProbabilites[distance])
                }
            })
            if (probabilities.length > 0){
                overallProbability += probabilities.reduce((a, b) => a*b, 1);
            }            
        })
        action.priority = overallProbability;
    })
}

function prepareNextState(action, diceRoll, currStateMyTokens, myPath, currStateOppTokens, oppPath) {
    //Pogledamo v prihodnost kakšno bo stanje po potezi.
    let currPathIdx = myPath.indexOf(action.selected_token);
    let newPos = myPath[currPathIdx + diceRoll];
    if (action.action == "place_new") {
        currStateMyTokens.push(myPath[diceRoll-1])
    }
    else if(action.action == "move_selected") {
        //Pride do konca zato ga odstranimo
        if(currPathIdx + diceRoll == myPath.length) {
            let removeIdx = currStateMyTokens.indexOf(action.selected_token); //1
            currStateMyTokens.splice(removeIdx, 1);
        }
        //Odstranimo nasprotnika, ki ga prehitimo in posodobimo polozaj
        else if(action.overtake == true) {
            let opponentIdx = currStateOppTokens.indexOf(newPos);
            currStateOppTokens.splice(opponentIdx, 1);
            let removeIdx = currStateMyTokens.indexOf(action.selected_token); //1
            currStateMyTokens.splice(removeIdx, 1);
            currStateMyTokens.push(newPos);
        }
        //V nasprotnem primeru samo posodobimo položaj
        else {
            let removeIdx = currStateMyTokens.indexOf(action.selected_token); 
            currStateMyTokens.splice(removeIdx, 1); //Odstranimo token iz p1Tokens
            currStateMyTokens.push(newPos);
        }
    }
    
    let myPosIdxs = []
    currStateMyTokens.forEach(tokenPos => {
        myPosIdxs.push(myPath.indexOf(tokenPos));
    })
    let oppPosIdxs = []
    currStateOppTokens.forEach(tokenPos => {
        oppPosIdxs.push(oppPath.indexOf(tokenPos));
    })
    return {'myTokenIndexes': myPosIdxs, 'oppTokenIndexes': oppPosIdxs}
}