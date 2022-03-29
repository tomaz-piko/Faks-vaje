function upArrowClick() {
    TERRAIN_VIEW_POSITION.row += 1;
    syncTable();
}

function rightArrowClick() {
    TERRAIN_VIEW_POSITION.col -= 1;
    syncTable();
}

function downArrowClick() {
    TERRAIN_VIEW_POSITION.row -= 1;
    syncTable();
}

function leftArrowClick() {
    TERRAIN_VIEW_POSITION.col += 1;
    syncTable();
}

function upperLeftArrowClick() {
    TERRAIN_VIEW_POSITION.row += 1;
    TERRAIN_VIEW_POSITION.col += 1;
    syncTable();
}

function upperRightArrowClick() {
    TERRAIN_VIEW_POSITION.row += 1;
    TERRAIN_VIEW_POSITION.col -= 1;
    syncTable();
}

function lowerRightArrowClick() {
    TERRAIN_VIEW_POSITION.row -= 1;
    TERRAIN_VIEW_POSITION.col -= 1;
    syncTable();
}

function lowerLeftArrowClick() {
    TERRAIN_VIEW_POSITION.row -= 1;
    TERRAIN_VIEW_POSITION.col += 1;
    syncTable();
}

function generateButtonClick() {
    init();
}

function toggleSimulButtonClick() {
    let button = document.getElementById("simulationButton");
    let prevHTML = button.innerHTML;
    button.innerHTML = prevHTML == 'Start' ? 'Stop' : 'Start';
}

function initSliders() {
    var older = document.body;
    return {
        terrainRows: new UI.Slide(older, "Terrain row count:", null, 25, [100, 65, 200, 20], 100, 5, ' ', 0),
        terrainCols: new UI.Slide(older, "Terrain column count:", null, 25, [100, 115, 200, 20], 100, 5, ' ', 0),

        groundPercentage: new UI.Slide(older, "Ground percentage:", null, 50, [100, 185, 200, 20], 100, 0, ' ', 0),
        bodyOfWaterCount: new UI.Slide(older, "Body of water count:", null, 2, [100, 235, 200, 20], 10, 0, ' ', 0),
        minimumRiverLength: new UI.Slide(older, "Minimum river length:", null, 1, [100, 285, 200, 20], 25, 0, ' ', 0),
        maximumLakeWidth: new UI.Slide(older, "Maximum lake width:", null, 4, [100, 335, 200, 20], 25, 0, ' ', 0),

        predatorCount: new UI.Slide(older, "Predator count:", null, 5, [100, 405, 200, 20], 100, 5, ' ', 0),
        preyCount: new UI.Slide(older, "Prey count:", null, 5, [100, 455, 200, 20], 100, 5, ' ', 0),
        foodCount: new UI.Slide(older, "Food count:", null, 20, [100, 505, 200, 20], 100, 20, ' ', 0)
    }
}