function spawnInitialAnimals(terrain, freeGroundSquares, predatorCount, preyCount) {
    let animals = [];

    for (let i = 0; i < predatorCount; i++) {
        const rand = randomInteger(0, freeGroundSquares.length - 1);
        const {row, col} = freeGroundSquares[rand];
        let predator = new Animal('lion', row, col, animals.length);
        terrain[row][col].occupiedBy = predator;
        animals.push(predator);
        freeGroundSquares = freeGroundSquares.filter(square => square.id !== rand);
    }

    for (let i = 0; i < preyCount; i++) {
        const rand = randomInteger(0, freeGroundSquares.length - 1);
        const {row, col} = freeGroundSquares[rand];
        let prey = new Animal('antilope', row, col, animals.length);
        terrain[row][col].occupiedBy = prey;
        animals.push(prey);
        freeGroundSquares = freeGroundSquares.filter(square => square.id !== rand);
    }

    return animals;
}

function spawnInitialFood(terrain, freeGroundSquares, foodCount) {
    let plants = [];

    for (let i = 0; i < foodCount; i++) {
        const rand = randomInteger(0, freeGroundSquares.length - 1);
        const {row, col} = freeGroundSquares[rand];
        let plant = new Plant('plant', randomInteger(5, 20), row, col, plants.length);
        terrain[row][col].occupiedBy = plant;
        plants.push(plant);
        freeGroundSquares = freeGroundSquares.filter(square => square.id !== rand);
    }
    
    return plants;
}

function spawnInitialEntities(terrain, predatorCount, preyCount, foodCount) {
    let freeGroundSquares = getAllGroundSquares(terrain);
    if(predatorCount + preyCount + foodCount > freeGroundSquares.length) {
        console.log("Error {entitieUtils->spawnInitialEntities}: Not enough ground for entities.")
        return {
            'animals': [],
            'plants': []
        }
    }
    const animals = spawnInitialAnimals(terrain, freeGroundSquares, predatorCount, preyCount);
    const plants = spawnInitialFood(terrain, freeGroundSquares, foodCount);
    return {
        animals,
        plants
    }
}