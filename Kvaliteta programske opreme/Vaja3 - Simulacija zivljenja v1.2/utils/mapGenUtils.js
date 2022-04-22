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
            let terrainTypeRand = randomInteger(0, 100);
            let terrainType = terrainTypeRand < groundPercentage ? 'ground' : 'water'; 
            row.push({terrainType: terrainType, occupiedBy: null});
        }
        terrain.push(row);
    }
    return terrain;
}

function generateRiverTerrain(rowCount, colCount, bodyOfWaterCount, minimumRiverLength) {
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