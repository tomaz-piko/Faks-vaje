function calcDist(x1, y1, x2, y2) {
    let y = x2 - x1;
    let x = y2 - y1;
    
    return Math.sqrt(x * x + y * y);
}

function findClosestWaterSquare(x, y, x_min, x_max, y_min, y_max) {
    let waterSquares = [];
    for (let i = x_min; i < x_max; i++) {
        for (let j = y_min; j < y_max; j++) {
            if(TERRAIN[i][j].terrainType === 'water') {
                let dist = calcDist(x, y, i, j);
                let square = {'row': i, 'col': j, 'dist': dist};
                waterSquares.push(square);
            }
        }           
    }
    if(!waterSquares) return undefined;
    waterSquares.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    return waterSquares[0];
}

function findClosestPrey(x, y, x_min, x_max, y_min, y_max) {
    let preys = [];
    for (let i = x_min; i < x_max; i++) {
        for (let j = y_min; j < y_max; j++) {
            if(TERRAIN[i][j].terrainType === 'water') continue;
            if(TERRAIN[i][j].occupiedBy && TERRAIN[i][j].occupiedBy.type === 'prey') {
                let dist = calcDist(x, y, i, j);
                let square = {'row': i, 'col': j, 'dist': dist};
                preys.push(square);
            }      
        }           
    }
    if(!preys) return undefined;
    preys.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    return preys[0];
}

function findClosestPlant(x, y, x_min, x_max, y_min, y_max) {
    let plants = [];
    for (let i = x_min; i < x_max; i++) {
        for (let j = y_min; j < y_max; j++) {
            if(TERRAIN[i][j].terrainType === 'water') continue;
            if(TERRAIN[i][j].occupiedBy && TERRAIN[i][j].occupiedBy.type === 'plant') {
                let dist = calcDist(x, y, i, j);
                let square = {'row': i, 'col': j, 'dist': dist};
                plants.push(square);
            }      
        }           
    }
    if(!plants) return undefined;
    plants.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    return plants[0];
}

function findRandomUnoccupiedSquare(x, y, x_min, x_max, y_min, y_max) {
    let squares = [];
    for (let i = x_min; i < x_max; i++) {
        for (let j = y_min; j < y_max; j++) {
            let neki = TERRAIN[i][j];
            if(TERRAIN[i][j].terrainType === 'water') continue;
            if(TERRAIN[i][j].occupiedBy) continue;
            let dist = calcDist(x, y, i, j);
            let square = {'row': i, 'col': j, 'dist': dist};
            if(dist == 1) {
                squares.push(square);                 
            }             
        }           
    }
    squares.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    return squares[(randomInteger(0, squares.length - 1))];
}

function isValidSquare(x, y) {
    const terrainRowCount = TERRAIN.length;
    const terrainColCount = TERRAIN[0].length;
    if(x < 0 || x >= terrainRowCount) return false;
    if(y < 0 || y >= terrainColCount) return false;
    if(TERRAIN[x][y].terrainType === 'water') return false;
    if(TERRAIN[x][y].occupiedBy) return false;
    return true;
}

function getAllGroundSquares(terrain) {
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    let groundSquares = [];
    for (let i = 0; i < terrainRowCount; i++) {
        for (let j = 0; j < terrainColCount; j++) {
            if(terrain[i][j].terrainType !== 'ground') continue;
            if(terrain[i][j].occupiedBy) continue;
            groundSquares.push({'row': i, 'col': j, 'id': groundSquares.length});
        }
    }
    return groundSquares;
}