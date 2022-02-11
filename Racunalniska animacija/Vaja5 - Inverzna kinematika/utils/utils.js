function onWindowResize() {
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

function removeObject3D(object3D) {
    if (!(object3D instanceof THREE.Object3D)) return false;
    // for better memory management and performance
    object3D.geometry.dispose();
    if (object3D.material instanceof Array) {
        // for better memory management and performance
        object3D.material.forEach(material => material.dispose());
    } else {
        // for better memory management and performance
        object3D.material.dispose();
    }
    object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
    return true;
}

function randomColorValue() {
    return randomInteger(0, 16777215);
}

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dist(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180/pi);
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deleteBallFromScene(ballName) {
    var selectedObject = SCENE.getObjectByName(ballName);
    removeObject3D(selectedObject);
}

function removeObject3D(object3D) {
    if (!(object3D instanceof THREE.Object3D)) return false;
    // for better memory management and performance
    object3D.geometry.dispose();
    if (object3D.material instanceof Array) {
        // for better memory management and performance
        object3D.material.forEach(material => material.dispose());
    } else {
        // for better memory management and performance
        object3D.material.dispose();
    }
    object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
    return true;
}