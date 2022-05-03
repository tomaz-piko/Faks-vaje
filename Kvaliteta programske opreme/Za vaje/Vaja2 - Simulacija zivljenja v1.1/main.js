let SLIDERS = initSliders();
let TERRAIN_VIEW_POSITION = {row: 0, col: 0};
let TERRAIN_TABLE_DIMS = {rowCount: 25, colCount: 25};
let TERRAIN = null;
let INTERVAL = null;
let INTERVAL_TIMER = 1500; 
let ENTITIES = null;

// Generates empty matrix used to show terrain in html
function generateHTMLTerrainTable() {
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
function cleanHTMLTerrainTable() {
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
function syncHTMLTerrainTable() {
    cleanHTMLTerrainTable();
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
    // RE-DO terrain table
    syncAnimalsOnTerrain();
    syncHTMLTerrainTable();
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
    syncHTMLTerrainTable();    
}

generateHTMLTerrainTable(TERRAIN_TABLE_DIMS.rowCount, TERRAIN_TABLE_DIMS.colCount);
init();