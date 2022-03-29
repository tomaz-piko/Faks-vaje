let TERRAIN_VIEW_POSITION = {row: 0, col: 0};
let TERRAIN_TABLE_DIMS = {rowCount: 25, colCount: 25};
let TERRAIN_DIMS = null;
let TERRAIN_COUNT = {ground: 0, water: 0};
let SLIDERS = null;
let TERRAIN = null;

function initSliders() {
    var older = document.body;
    SLIDERS = {
        terrainSize_rows: new UI.Slide(older, "Terrain row count:", null, 25, [100, 65, 200, 20], 100, 5, ' ', 0),
        terrainSize_cols: new UI.Slide(older, "Terrain column count:", null, 25, [100, 115, 200, 20], 100, 5, ' ', 0),

        groundTerrain_percentage: new UI.Slide(older, "Ground percentage:", null, 50, [100, 185, 200, 20], 100, 0, ' ', 0),
        bodyOfWater_count: new UI.Slide(older, "Body of water count:", null, 1, [100, 235, 200, 20], 10, 0, ' ', 0),
        minimumRiverLength: new UI.Slide(older, "Minimum river length:", null, 1, [100, 285, 200, 20], 25, 0, ' ', 0),
        maximumLakeWidth: new UI.Slide(older, "Maximum lake width:", null, 1, [100, 335, 200, 20], 25, 0, ' ', 0),

        predator_count: new UI.Slide(older, "Predator count:", null, 5, [100, 405, 200, 20], 100, 5, ' ', 0),
        prey_count: new UI.Slide(older, "Prey count:", null, 5, [100, 455, 200, 20], 100, 5, ' ', 0),
        food_count: new UI.Slide(older, "Food count:", null, 20, [100, 505, 200, 20], 100, 20, ' ', 0)
    }
}

function generateTerrainTable(rowCount, colCount) {
    const terrainTable = document.getElementById("terrainTable");
    for (let i = 0; i < rowCount; i++) {
        let row = terrainTable.insertRow();
        for (let j = 0; j < colCount; j++) {
            let cell = row.insertCell();
            let cellId = i + '_' + j;
            cell.id = cellId;
        }
    }
}

function cleanTerrainTable(rowCount, colCount) {
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            let cellId = i + '_' + j;
            let cell = document.getElementById(cellId);
            cell.classList.remove(...cell.classList);
            cell.innerHTML = '';
        }
    }
}

function generateTerrain(rowCount, colCount) {
    TERRAIN = [];
    for (let i = 0; i < rowCount; i++) {
        let row = [];
        for (let j = 0; j < colCount; j++) {
            let terrainType = randomInteger(0, 1); //0 water, 1 ground
            let terrainTypeDesc = terrainType == 0 ? 'water' : 'ground';
            TERRAIN_COUNT[terrainTypeDesc] += 1;
            row.push({terrainType: terrainTypeDesc, occupiedBy: null});
        }
        TERRAIN.push(row);
    }
}

function generateFullGroundTerrain(rowCount, colCount) {
    TERRAIN = [];
    for (let i = 0; i < rowCount; i++) {
        let row = [];
        for (let j = 0; j < colCount; j++) {
            row.push({terrainType: 'ground', occupiedBy: null});
        }
        TERRAIN.push(row);
    }
}

function generateRandomTerrain(rowCount, colCount, groundPercentage) {
    console.log(rowCount);
    console.log(colCount);
    console.log(groundPercentage);
    TERRAIN = [];
    let cellCount = rowCount * colCount;
    let groundCellCount = Math.round((groundPercentage / 100) * cellCount);
    let waterCellCount = cellCount - groundCellCount;
    for (let i = 0; i < rowCount; i++) {
        let row = [];
        for (let j = 0; j < colCount; j++) {
            let terrainType = randomInteger(0, 100); //0 water, 1 ground
            if (terrainType < groundPercentage) {
                terrainTypeDesc = 'ground';
            }
            else {
                terrainTypeDesc = 'water';
            }
            TERRAIN_COUNT[terrainTypeDesc] += 1;
            row.push({terrainType: terrainTypeDesc, occupiedBy: null});
        }
        TERRAIN.push(row);
    }
}

function createRiver(minimumRiverLength) {
    let x, y;
    let startingPoint = randomInteger(1, 4);
    switch (startingPoint) {
        case 1:
            x = 0;
            y = randomInteger(0, TERRAIN_DIMS.colCount - 1);
            break;
        case 2:
            x = randomInteger(0, TERRAIN_DIMS.rowCount - 1);
            y = 0;
            break;
        case 3:
            x = TERRAIN_DIMS.rowCount - 1;
            y = randomInteger(0, TERRAIN_DIMS.colCount - 1);
            break;
        case 4:
            x = randomInteger(0, TERRAIN_DIMS.rowCount - 1);
            y = TERRAIN_DIMS.colCount - 1;
            break;
        default:
            x = 0;
            y = 0;
            break;
    }
    TERRAIN[x][y].terrainType = 'water';
    //left x: -1
    //right x: +1
    //up y: -1
    //down y: 1
    let prevX, prevY;
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
        if(x2 < 0 || x2 >= TERRAIN_DIMS.rowCount) break;
        if(y2 < 0 || y2 >= TERRAIN_DIMS.colCount) break;
        if(TERRAIN[x2][y2].terrainType == 'water') {
            continue;
        }
        TERRAIN[x2][y2].terrainType = 'water';
        x = x2;
        y = y2;
    }
}

function generateRiverTerrain(bodyOfWaterCount, minimumRiverLength) {
    //Start point should be on edge of map
    //x: 0 y: 0 - 99 => top edge OPTION1
    //y: 0 x: 0 - 99 => left edge OPTION2
    //x: 99 y: 0-99 => bottom edge OPTION3
    //y: 99 x: 0-99 => right edge OPTION4
    generateFullGroundTerrain(TERRAIN_DIMS.rowCount, TERRAIN_DIMS.colCount);
    for (let i = 0; i < bodyOfWaterCount; i++) {
        createRiver();
    }
}

function createLake(width) {
    let x = randomInteger(0, TERRAIN_DIMS.rowCount - 1);
    let y = randomInteger(0, TERRAIN_DIMS.colCount - 1);
    for (let i = x; i < x + width; i++) {
        if(i >= TERRAIN_DIMS.rowCount) continue;
        for (let j = y; j < y + width; j++) {
            if(j >= TERRAIN_DIMS.colCount) continue;
            TERRAIN[i][j].terrainType = 'water';
        }
    }
}

function generateLakeTerrain(bodyOfWaterCount, maximumLakeWidth) {
    generateFullGroundTerrain(TERRAIN_DIMS.rowCount, TERRAIN_DIMS.colCount);
    for (let i = 0; i < bodyOfWaterCount; i++) {
        let lakeWidth = randomInteger(1, maximumLakeWidth);
        createLake(lakeWidth);
    }
}

function generateMixedTerrain(bodyOfWaterCount, minimumRiverLength, maximumLakeWidth) {
    generateFullGroundTerrain(TERRAIN_DIMS.rowCount, TERRAIN_DIMS.colCount);
    for (let i = 0; i < bodyOfWaterCount; i++) {
        let bodyOfWaterType = randomInteger(0, 1);
        if(bodyOfWaterType === 0) {
            let lakeWidth = randomInteger(1, maximumLakeWidth);
            createLake(lakeWidth);
        }
        else {
            createRiver(minimumRiverLength);
        }
    }
}

function syncTable() {
    cleanTerrainTable(TERRAIN_TABLE_DIMS.rowCount, TERRAIN_TABLE_DIMS.colCount);
    for (let i = 0; i < TERRAIN_DIMS.rowCount; i++) {
        for (let j = 0;  j < TERRAIN_DIMS.colCount; j++) {
            let _i = TERRAIN_VIEW_POSITION.row + i;
            let _j = TERRAIN_VIEW_POSITION.col + j;
            if (_i < 0 || _i >= TERRAIN_TABLE_DIMS.rowCount) continue;
            else if (_j < 0 || _j >= TERRAIN_TABLE_DIMS.colCount) continue;
            let cellId = _i + '_' + _j;
            let cell = document.getElementById(cellId);
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

function spawnAnimals(predatorCount, preyCount) {
    for (let i = 0; i < predatorCount; i++) {
        while (true) {
            let row = randomInteger(0, TERRAIN_DIMS.rowCount - 1);
            let col = randomInteger(0, TERRAIN_DIMS.colCount - 1);
            if (TERRAIN[row][col].terrainType == 'water') continue;
            if (TERRAIN[row][col].occupiedBy != undefined) continue;
            let predator = new Animal(100, 100, 100, 40, false, 3, 50, 4, 'predator');
            TERRAIN[row][col].occupiedBy = predator;
            break;
        }
    }

    for (let i = 0; i < preyCount; i++) {
        while (true) {
            let row = randomInteger(0, TERRAIN_DIMS.rowCount - 1);
            let col = randomInteger(0, TERRAIN_DIMS.colCount - 1);
            if (TERRAIN[row][col].terrainType == 'water') continue;
            if (TERRAIN[row][col].occupiedBy != undefined) continue;
            let prey = new Animal(100, 100, 100, 40, false, 3, 50, 4, 'prey');
            TERRAIN[row][col].occupiedBy = prey;
            break;
        }
    }
}

function spawnFood(foodCount) {
    for (let i = 0; i < foodCount; i++) {
        while (true) {
            let row = randomInteger(0, TERRAIN_DIMS.rowCount - 1);
            let col = randomInteger(0, TERRAIN_DIMS.colCount - 1);
            if (TERRAIN[row][col].terrainType == 'water') continue;
            if (TERRAIN[row][col].occupiedBy != undefined) continue;
            let plant = new Plant('plant', randomInteger(5, 20));
            TERRAIN[row][col].occupiedBy = plant;
            break;
        }        
    }
}

function spawnEntities() {
    let foodCount = SLIDERS.food_count.value;
    let predatorCount = SLIDERS.predator_count.value;
    let preyCount = SLIDERS.prey_count.value;
    if (foodCount + predatorCount + preyCount >= TERRAIN_COUNT.ground) return;
    spawnAnimals(predatorCount, predatorCount);
    spawnFood(foodCount);
}

function init() {
    TERRAIN_DIMS = {rowCount: SLIDERS.terrainSize_rows.value, colCount: SLIDERS.terrainSize_cols.value}
    let terrainType = document.getElementById("terrainTypeSelect").value;
    switch (terrainType) {
        case 'random':
            generateRandomTerrain(TERRAIN_DIMS.rowCount, TERRAIN_DIMS.colCount, SLIDERS.groundTerrain_percentage.value);
            break;
        case 'rivers':
            generateRiverTerrain(SLIDERS.bodyOfWater_count.value, SLIDERS.minimumRiverLength.value);
            break;
        case 'lakes':
            generateLakeTerrain(SLIDERS.bodyOfWater_count.value, SLIDERS.maximumLakeWidth.value);
            break;
        case 'mixed':
            generateMixedTerrain(SLIDERS.bodyOfWater_count.value);
            break;
        default:
            break;
    }
    spawnEntities();
    syncTable();
}

initSliders();
generateTerrainTable(TERRAIN_TABLE_DIMS.rowCount, TERRAIN_TABLE_DIMS.colCount);
init();