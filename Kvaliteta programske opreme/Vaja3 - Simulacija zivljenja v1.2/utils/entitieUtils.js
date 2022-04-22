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