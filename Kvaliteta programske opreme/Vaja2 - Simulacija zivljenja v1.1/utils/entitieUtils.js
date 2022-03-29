function spawnInitialAnimals(terrain, predatorCount, preyCount) {
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    for (let i = 0; i < predatorCount; i++) {
        let counter = 0;
        while (true) {
            let row = randomInteger(0, terrainRowCount - 1);
            let col = randomInteger(0, terrainColCount - 1);
            if (terrain[row][col].terrainType == 'water') continue;
            if (terrain[row][col].occupiedBy != undefined) continue;
            let predator = new Animal(100, 100, 100, 40, false, 3, 50, 4, 'predator');
            terrain[row][col].occupiedBy = predator;
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
            let prey = new Animal(100, 100, 100, 40, false, 3, 50, 4, 'prey');
            terrain[row][col].occupiedBy = prey;
            counter++;
            if(counter > 5) return;
            break;
        }
    }
}

function spawnInitialFood(terrain, foodCount) {
    const terrainRowCount = terrain.length;
    const terrainColCount = terrain[0].length;
    for (let i = 0; i < foodCount; i++) {
        let counter = 0;
        while (true) {
            let row = randomInteger(0, terrainRowCount - 1);
            let col = randomInteger(0, terrainColCount - 1);
            if (terrain[row][col].terrainType == 'water') continue;
            if (terrain[row][col].occupiedBy != undefined) continue;
            let plant = new Plant('plant', randomInteger(5, 20));
            terrain[row][col].occupiedBy = plant;
            counter++;
            if(counter > 5) return;
            break;
        }        
    }
}

function spawnInitialEntities(terrain, predatorCount, preyCount, foodCount) {   
    spawnInitialAnimals(terrain, predatorCount, preyCount);
    spawnInitialFood(terrain, foodCount);
}