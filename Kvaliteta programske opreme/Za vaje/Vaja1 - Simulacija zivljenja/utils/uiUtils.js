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
    toggleSimulation();
}