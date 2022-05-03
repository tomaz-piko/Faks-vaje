class Animal {
    constructor(specie, row, col) {
        const speciesSpecifications = getSpecifications(specie);
        const {type, hungerRange, thirstRange, speedRange, sizeRange, sensRange, maxAge} = speciesSpecifications;
        
        this.type = type;
        this.specie = specie;
        this.hunger = randomInteger(hungerRange.min, hungerRange.max);
        this.thirst = randomInteger(thirstRange.min, thirstRange.max);
        this.speed = randomInteger(speedRange.min, speedRange.max);
        this.size = randomInteger(sizeRange.min, sizeRange.max);
        this.age = randomInteger(0, Math.floor(maxAge/2));
        this.sensRange = sensRange;
        this.sex = (randomInteger(0, 1) == 0) ? 'M' : 'F';
        this.position = {row, col};
        this.isDead = false;
    }

    moveUp() {
        this.position.row -= 1;
        if(this.position.row < 0) this.position.row = 0;
    }

    moveDown(limit) {
        this.position.row += 1;
        if(this.position.row >= limit) this.position.row = limit - 1;
    }

    moveLeft() {
        this.position.col -= 1;
        if(this.position.col < 0) this.position.col = 0;
    }

    moveRight(limit) {
        this.position.col += 1;
        if(this.position.col >= limit) this.position.col = limit - 1;
    }

    update() {
        this.grow();
        this.thirst -= 5;
        this.hunger -= 5;
        if(this.thirst < 0 || this.hunger < 0) {
            this.kill();
        }
    }

    moveTowards(terrain, newPos) {
        const terrainRowCount = terrain.length;
        const terrainColCount = terrain[0].length;

        if(this.position.row < newPos.row) {
            if (isValidSquare(this.position.row + 1, this.position.col)) {
                this.moveDown(terrainRowCount);
                return;
            }
        }
        if(this.position.row > newPos.row) {
            if (isValidSquare(this.position.row - 1, this.position.col)) {
                this.moveUp();
                return;
            }
        }
        if(this.position.col < newPos.col) {
            if (isValidSquare(this.position.row, this.position.col + 1)) {
                this.moveRight(terrainColCount);
                return;
            }
        }
        if(this.position.col > newPos.col) {
            if (isValidSquare(this.position.row, this.position.col - 1)) {
                this.moveLeft();
                return;
            }
        }
    }

    move(terrain) {
        const terrainRowCount = terrain.length;
        const terrainColCount = terrain[0].length;

        const currPos = this.position;
        const range = this.sensRange;
        
        let x_min = currPos.row - range;
        let x_max = currPos.row + range;
        let y_min = currPos.col - range;
        let y_max = currPos.col + range;
        if (x_min < 0) x_min = 0;
        else if (x_max >= terrainRowCount) x_max = terrainRowCount - 1;
        if (y_min < 0) y_min = 0;
        else if (y_max >= terrainColCount) y_max = terrainColCount - 1;

        if(this.thirst < this.hunger) {
            const closestWaterSquare = findClosestWaterSquare(currPos.row, currPos.col, x_min, x_max, y_min, y_max);           
            if(closestWaterSquare) {
                if(closestWaterSquare.dist === 1) {
                    // Drink from one square away
                    this.drink();
                    return;
                }
                else {
                    // Move towards the closest water square
                    this.moveTowards(terrain, closestWaterSquare);
                    return;
                }
            }           
        }
        if(this.type === 'predator') {
            const closestPrey = findClosestPrey(currPos.row, currPos.col, x_min, x_max, y_min, y_max);
            if(closestPrey) {
                if(closestPrey.dist === 1) {
                    this.eat();
                    return;
                }
                else {
                    this.moveTowards(terrain, closestPrey);
                    return;
                }
            }           
        }
        if(this.type === 'prey') {
            const closestPlant = findClosestPlant(currPos.row, currPos.col, x_min, x_max, y_min, y_max);
            if(closestPlant) {
                if(closestPlant.dist === 1) {
                    this.eat();
                    return;
                }
                else {
                    this.moveTowards(terrain, closestPlant);
                    return;
                }
            }            
        }
        const newPos = findRandomUnoccupiedSquare(currPos.row, currPos.col, x_min, x_max, y_min, y_max);
        if(newPos) {
            this.position = {row: newPos.row, col: newPos.col};
            return;
        }
    }

    drink() {
        const speciesSpecifications = getSpecifications(this.specie);
        const {thirstRange} = speciesSpecifications;
        this.thirst += 25;
        if(this.thirst > thirstRange.max) {
            this.thirst = thirstRange.max; 
        }        
    }

    eat() {
        const speciesSpecifications = getSpecifications(this.specie);
        const {hungerRange} = speciesSpecifications;
        this.hunger += 25;
        if(this.hunger > hungerRange.max) {
            this.hunger = hungerRange.max;
        }
        
    }

    grow() {
        const speciesSpecifications = getSpecifications(this.type);
        const {hungerRange, thirstRange, speedRange, sizeRange, sensRange, maxAge} = speciesSpecifications;

        this.age += 1;
        if(this.age > maxAge) {
            this.kill();
        }

        if(this.hunger > Math.floor(hungerRange.max/2)) {
            this.size += 1;
            this.speed -= 1;
        }
        else {
            this.size -=1;
            this.speed += 1;
        }

        if(this.thirst > Math.floor(thirstRange.max/2)) {
            this.size -= 1;
            this.speed += 1;
        }
        else {
            this.size +=1;
            this.speed -= 1;
        }
    }

    kill() {
        this.isDead = true;
    }
}