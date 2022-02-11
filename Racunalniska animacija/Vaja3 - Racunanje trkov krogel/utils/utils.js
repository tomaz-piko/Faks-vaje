function onWindowResize() {
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
}

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToMinDecimals(num, numOfDecimals) {
    let x = 10^numOfDecimals;
    return Math.round((num + Number.EPSILON) * 100) / 100
}

function randomColorValue() {
    return randomInteger(0, 16777215);
}
