let SLIDERS = null;
let TERRAIN_VIEW_POSITION = {row: 0, col: 0};
let TERRAIN_TABLE_DIMS = {rowCount: 25, colCount: 25};
let TERRAIN = null;
let INTERVAL = null;
let INTERVAL_TIMER = 1500; 
let ENTITIES = null;

function initSliders() {
    var older = document.body;
    SLIDERS = {
        terrainRows: new UI.Slide(older, "Terrain row count:", null, 25, [100, 65, 200, 20], 100, 5, ' ', 0),
        terrainCols: new UI.Slide(older, "Terrain column count:", null, 25, [100, 115, 200, 20], 100, 5, ' ', 0),

        groundPercentage: new UI.Slide(older, "Ground percentage:", null, 75, [100, 185, 200, 20], 100, 0, ' ', 0),
        bodyOfWaterCount: new UI.Slide(older, "Body of water count:", null, 2, [100, 235, 200, 20], 10, 0, ' ', 0),
        minimumRiverLength: new UI.Slide(older, "Minimum river length:", null, 1, [100, 285, 200, 20], 25, 0, ' ', 0),
        maximumLakeWidth: new UI.Slide(older, "Maximum lake width:", null, 4, [100, 335, 200, 20], 25, 0, ' ', 0),

        predatorCount: new UI.Slide(older, "Predator count:", null, 5, [100, 405, 200, 20], 100, 5, ' ', 0),
        preyCount: new UI.Slide(older, "Prey count:", null, 5, [100, 455, 200, 20], 100, 5, ' ', 0),
        foodCount: new UI.Slide(older, "Food count:", null, 20, [100, 505, 200, 20], 100, 20, ' ', 0)
    }
}

/* TABLE FUNCTIONS */
// Generates empty matrix used to show terrain in html
function generateTerrainTable() {
    let terrainTable = document.getElementById("terrainTable");
    for (let i = 0; i < TERRAIN_TABLE_DIMS.rowCount; i++) {
        let row = terrainTable.insertRow();
        for (let j = 0; j < TERRAIN_TABLE_DIMS.colCount; j++) {
            let cell = row.insertCell();
            let cellId = i + '_' + j;
            cell.id = cellId;
        }
    }
}

// Removes classes from the html table
function cleanTerrainTable() {
    for (let i = 0; i < TERRAIN_TABLE_DIMS.rowCount; i++) {
        for (let j = 0; j < TERRAIN_TABLE_DIMS.colCount; j++) {
            let cellId = i + '_' + j;
            let cell = document.getElementById(cellId);
            cell.classList.remove(...cell.classList);
            cell.innerHTML = '';
        }
    }
}

// Synchronizes data shown in table with view position
function syncTable() {
    cleanTerrainTable();
    const terrainRowCount = TERRAIN.length;
    const terrainColCount = TERRAIN[0].length;
    for (let i = 0; i < terrainRowCount; i++) {
        for (let j = 0;  j < terrainColCount; j++) {
            let _i = TERRAIN_VIEW_POSITION.row + i;
            let _j = TERRAIN_VIEW_POSITION.col + j;
            if (_i < 0 || _i >= TERRAIN_TABLE_DIMS.rowCount) continue;
            if (_j < 0 || _j >= TERRAIN_TABLE_DIMS.colCount) continue;
            let cellId = _i + '_' + _j;
            let cell = document.getElementById(cellId);
            //cell.classList.remove(...cell.classList);
            //cell.innerHTML = '';
            if (TERRAIN[i][j].terrainType == 'water') {
                cell.classList.add("waterTerrainColor");
            }
            else if (TERRAIN[i][j].terrainType == 'ground') {
                cell.classList.add("groundTerrainColor");
            }
            if (TERRAIN[i][j].occupiedBy) {
                if (TERRAIN[i][j].occupiedBy.type == 'predator') {
                    cell.innerHTML = '<img src="./icons/predator.png" class="animalImg">';
                }
                else if (TERRAIN[i][j].occupiedBy.type == 'prey') {
                    cell.innerHTML = '<img src="./icons/prey.png" class="animalImg">';
                }
                else if (TERRAIN[i][j].occupiedBy.type == 'plant') {
                    cell.innerHTML = '<img src="./icons/plant.png" class="animalImg">';
                }
            }           
        }       
    }
}

/* MAP GEN FUNCTIONS */
function createRiver(terrain, minimumRiverLength) {
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    const startingPoint = randomInteger(1, 4);
    let x, y;
    switch (startingPoint) {
        case 1:
            x = 0;
            y = randomInteger(0, terrainColCount - 1);
            break;
        case 2:
            x = randomInteger(0, terrainRowCount - 1);
            y = 0;
            break;
        case 3:
            x = terrainRowCount - 1;
            y = randomInteger(0, terrainColCount - 1);
            break;
        case 4:
            x = randomInteger(0, terrainRowCount - 1);
            y = terrainColCount - 1;
            break;
        default:
            x = 0;
            y = 0;
            break;
    }
    terrain[x][y].terrainType = 'water';
    //left x: -1
    //right x: +1
    //up y: -1
    //down y: 1
    while (true) {
        let x2 = x;
        let y2 = y;
        let direction = randomInteger(1, 4);
        switch (direction) {
            case 1:
                x2 -= 1;
                break;
            case 2:
                x2 += 1;
                break;
            case 3:
                y2 -= 1;
                break;
            case 4:
                y2 += 1;
                break;
            default:
                break;
        }
        if(x2 < 0 || x2 >= terrainRowCount) break;
        if(y2 < 0 || y2 >= terrainColCount) break;
        if(terrain[x2][y2].terrainType == 'water') {
            break;
        }
        terrain[x2][y2].terrainType = 'water';
        x = x2;
        y = y2;
    }
}

function createLake(terrain, width) {
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    let x = randomInteger(0, terrainRowCount - 1);
    let y = randomInteger(0, terrainColCount - 1);
    for (let i = x; i < x + width; i++) {
        if(i >= terrainRowCount) continue;
        for (let j = y; j < y + width; j++) {
            if(j >= terrainColCount) continue;
            terrain[i][j].terrainType = 'water';
        }
    }
}

function generateFullGroundTerrain(rowCount, colCount) {
    let terrain = [];
    for (let i = 0; i < rowCount; i++) {
        let row = [];
        for (let j = 0; j < colCount; j++) {
            row.push({terrainType: 'ground', occupiedBy: null});
        }
        terrain.push(row);
    }
    return terrain;
}

function generateRandomTerrain(rowCount, colCount, groundPercentage) {
    let terrain = [];
    for (let i = 0; i < rowCount; i++) {
        let row = [];
        for (let j = 0; j < colCount; j++) {
            let terrainTypeRand = randomInteger(0, 100); //0 water, 1 ground
            let terrainType = terrainTypeRand < groundPercentage ? 'ground' : 'water'; 
            row.push({terrainType: terrainType, occupiedBy: null});
        }
        terrain.push(row);
    }
    return terrain;
}

function generateRiverTerrain(rowCount, colCount, bodyOfWaterCount, minimumRiverLength) {
    //Start point should be on edge of map
    //x: 0 y: 0 - 99 => top edge OPTION1
    //y: 0 x: 0 - 99 => left edge OPTION2
    //x: 99 y: 0-99 => bottom edge OPTION3
    //y: 99 x: 0-99 => right edge OPTION4
    let terrain = generateFullGroundTerrain(rowCount, colCount);
    for (let i = 0; i < bodyOfWaterCount; i++) {
        createRiver(terrain, minimumRiverLength);
    }
    return terrain;
}

function generateLakeTerrain(rowCount, colCount, bodyOfWaterCount, maximumLakeWidth) {
    let terrain = generateFullGroundTerrain(rowCount, colCount);
    for (let i = 0; i < bodyOfWaterCount; i++) {
        let lakeWidth = randomInteger(2, maximumLakeWidth);
        createLake(terrain, lakeWidth);
    }
    return terrain;
}

function generateMixedTerrain(rowCount, colCount, bodyOfWaterCount, minimumRiverLength, maximumLakeWidth) {
    let terrain = generateFullGroundTerrain(rowCount, colCount);
    for (let i = 0; i < bodyOfWaterCount; i++) {
        let bodyOfWaterType = randomInteger(0, 1);
        if(bodyOfWaterType === 0) {
            let lakeWidth = randomInteger(1, maximumLakeWidth);
            createLake(terrain, lakeWidth);
            continue;
        }
        createRiver(terrain, minimumRiverLength);
    }
    return terrain;
}

function generateTerrain(rowCount, colCount, terrainType, groundPercentage, bodyOfWaterCount, minimumRiverLength, maximumLakeWidth) {
    switch (terrainType) {
        case 'random':
            return generateRandomTerrain(rowCount, colCount, groundPercentage);
        case 'rivers':
            return generateRiverTerrain(rowCount, colCount, bodyOfWaterCount, minimumRiverLength);
        case 'lakes':
            return generateLakeTerrain(rowCount, colCount, bodyOfWaterCount, maximumLakeWidth);
        case 'mixed':
            return generateMixedTerrain(rowCount, colCount, bodyOfWaterCount, minimumRiverLength, maximumLakeWidth);
        default:
            return generateFullGroundTerrain(rowCount, colCount, groundPercentage);
    }
}

/* TERRAIN FUNCTIONS */
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

function syncAnimalsOnTerrain() {
    const terrainRowCount = TERRAIN.length;
    const terrainColCount = TERRAIN[0].length;
    for (let i = 0; i < terrainRowCount; i++) {
        for (let j = 0;  j < terrainColCount; j++) {
            TERRAIN[i][j].occupiedBy = null;
        }
    }
    ENTITIES.animals.forEach(animal => {
        TERRAIN[animal.position.row][animal.position.col].occupiedBy = animal;
    });
    ENTITIES.plants.forEach(plant => {
        TERRAIN[plant.position.row][plant.position.col].occupiedBy = plant;
    })
}

/* ENTITIE FUNCTIONS */
function spawnInitialAnimals(terrain, predatorCount, preyCount) {
    let animals = [];
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    for (let i = 0; i < predatorCount; i++) {
        let counter = 0;
        while (true) {
            let row = randomInteger(0, terrainRowCount - 1);
            let col = randomInteger(0, terrainColCount - 1);
            if (terrain[row][col].terrainType == 'water') continue;
            if (terrain[row][col].occupiedBy != undefined) continue;
            let predator = new Animal('lion', row, col);
            terrain[row][col].occupiedBy = predator;
            animals.push(predator);
            counter++;
            if(counter > 5) return;
            break;
        }
    }

    for (let i = 0; i < preyCount; i++) {
        let counter = 0;
        while (true) {
            let row = randomInteger(0, terrainRowCount - 1);
            let col = randomInteger(0, terrainColCount - 1);
            if (terrain[row][col].terrainType == 'water') continue;
            if (terrain[row][col].occupiedBy != undefined) continue;
            let prey = new Animal('antilope', row, col);
            terrain[row][col].occupiedBy = prey;
            animals.push(prey);
            counter++;
            if(counter > 5) return;
            break;
        }
    }
    return animals;
}

function spawnInitialFood(terrain, foodCount) {
    let plants = [];
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    for (let i = 0; i < foodCount; i++) {
        let counter = 0;
        while (true) {
            let row = randomInteger(0, terrainRowCount - 1);
            let col = randomInteger(0, terrainColCount - 1);
            if (terrain[row][col].terrainType == 'water') continue;
            if (terrain[row][col].occupiedBy != undefined) continue;
            let plant = new Plant('plant', randomInteger(5, 20), row, col);
            terrain[row][col].occupiedBy = plant;
            plants.push(plant);
            counter++;
            if(counter > 5) return;
            break;
        }        
    }
    return plants;
}

function spawnInitialEntities(terrain, predatorCount, preyCount, foodCount) {   
    const animals = spawnInitialAnimals(terrain, predatorCount, preyCount);
    const plants = spawnInitialFood(terrain, foodCount);
    return {
        animals,
        plants
    }
}

function toggleSimulation() {
    if(INTERVAL) {
        clearInterval(INTERVAL);
        INTERVAL = null;
        return;
    }
    INTERVAL = setInterval(doSimulationStep, INTERVAL_TIMER);
}

function doSimulationStep() {
    // Sort animals by speed
    ENTITIES.animals.sort((a, b) => parseInt(b.speed) - parseInt(a.speed));
    // For each animal do movement
    ENTITIES.animals.forEach(animal => {
        if(animal.isDead) return;
        animal.update();
        animal.move(TERRAIN);       
    });
    console.log(ENTITIES.animals);
    // RE-DO terrain table
    syncAnimalsOnTerrain();
    syncTable();
}

function init() {
    const selectedTerrainType = document.getElementById("terrainTypeSelect").value;
    TERRAIN = generateTerrain(
        SLIDERS.terrainRows.value,
        SLIDERS.terrainCols.value,
        selectedTerrainType,
        SLIDERS.groundPercentage.value,
        SLIDERS.bodyOfWaterCount.value,
        SLIDERS.minimumRiverLength.value,
        SLIDERS.maximumLakeWidth.value
    );
    
    ENTITIES = spawnInitialEntities(
        TERRAIN,
        SLIDERS.predatorCount.value,
        SLIDERS.preyCount.value,
        SLIDERS.foodCount.value
    );
    console.log(ENTITIES);
    syncTable();    
}

initSliders();
generateTerrainTable(TERRAIN_TABLE_DIMS.rowCount, TERRAIN_TABLE_DIMS.colCount);
init();