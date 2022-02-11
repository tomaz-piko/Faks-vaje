let SCENE, CAMERA, RENDERER, CONTROLS, WORLD;
let ground_body, ground_mesh;
let bodys = [];
let meshs = [];
let sliders;

function initThree() {
    //Init renderer
    RENDERER = new THREE.WebGLRenderer({antialias: true});
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas").appendChild(RENDERER.domElement);
    //Init scene
    SCENE = new THREE.Scene();
    SCENE.background = new THREE.Color( 0x2b2d2f );
    //Init camera
    CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //Init orbital controls
    CONTROLS = new THREE.OrbitControls(CAMERA, RENDERER.domElement);
    CAMERA.position.set( 25, 5, 40 );
    CONTROLS.update();
}

function initWorld() {
    WORLD = new OIMO.World({
        timestep: 1/144,
        iterations: 8,
        broadphase: 2,
        worldscale: 1,
        random: true,
        info: false,
        gravity: [0, -9.8, 0]
    });
}

function init() {
    initThree();
    initWorld();

    var older = document.body;
    sliders = {
        ground_angle: new UI.Slide(older, "Ground angle:", rotateGround, SETTINGS.INITIAL_GROUND_ANGLE, [100, 120, 200, 20], 90, -90, '°', 2),
        ground_friction: new UI.Slide(older, "Ground friction:", updateGround, 0.2, [100, 180, 200, 20], SETTINGS.FRICTION_MAX, SETTINGS.FRICTION_MIN, ' ', 2),
        ground_restitution: new UI.Slide(older, "Ground restitution:", updateGround, 0.2, [100, 240, 200, 20], SETTINGS.RESTITUTION_MAX, SETTINGS.RESTITUTION_MIN, ' ', 2),
        objects_count: new UI.Slide(older, "Objects count:", null, SETTINGS.INITIAL_OBJECTS_COUNT, [100, 300, 200, 20], SETTINGS.OBJECTS_MAX, 0, ' '),
        objects_size: new UI.Slide(older, "Objects size:", null, SETTINGS.INITIAL_OBJECTS_SIZE, [100, 360, 200, 20], 2, 0.1, ' ', 1),
        objects_friction: new UI.Slide(older, "Objects friction:", null, 0.2, [100, 420, 200, 20], SETTINGS.FRICTION_MAX, SETTINGS.FRICTION_MIN, ' ', 2),
        objects_restitution: new UI.Slide(older, "Objects restitution:", null, 0.2, [100, 480, 200, 20], SETTINGS.RESTITUTION_MAX, SETTINGS.RESTITUTION_MIN, ' ', 2)
    }

    //Add ground to world.
    ground_body = WORLD.add({
        type: 'box',
        size: [SETTINGS.GROUND_DIMS.x, SETTINGS.GROUND_DIMS.y, SETTINGS.GROUND_DIMS.z],
        pos: [SETTINGS.GROUND_POS.x, SETTINGS.GROUND_POS.y, SETTINGS.GROUND_POS.z],
        rot: [0, 0, -sliders.ground_angle.value],
        move: false,
        density: 1,
        friction: sliders.ground_friction.value,
        restitution: sliders.ground_restitution.value,
        belongsTo: 1,
        collidesWith: 0xffffffff
    });

    //Add a mesh for ground.
    const geometry = new THREE.BoxGeometry(SETTINGS.GROUND_DIMS.x, SETTINGS.GROUND_DIMS.y, SETTINGS.GROUND_DIMS.z);
    const material = new THREE.MeshBasicMaterial( {color: 0xBEBEBE, wireframe: true} );
    ground_mesh = new THREE.Mesh( geometry, material );
    SCENE.add(ground_mesh);

    ground_mesh.position.copy(ground_body.getPosition());
    ground_mesh.quaternion.copy(ground_body.getQuaternion()); 
}

function rotateGround() {
    let z = sliders.ground_angle.value;
    var quat = new THREE.Quaternion();
    
    var mtx = new THREE.Matrix4();
    mtx.makeRotationZ(-degrees_to_radians(z));

    quat.setFromRotationMatrix(mtx);
    ground_body.setQuaternion(quat);
    ground_mesh.quaternion.copy(quat);
}

function updateGround() {
    ground_body.remove();
    ground_body = WORLD.add({
        type: 'box',
        size: [SETTINGS.GROUND_DIMS.x, SETTINGS.GROUND_DIMS.y, SETTINGS.GROUND_DIMS.z],
        pos: [SETTINGS.GROUND_POS.x, SETTINGS.GROUND_POS.y, SETTINGS.GROUND_POS.z],
        rot: [0, 0, -sliders.ground_angle.value],
        move: false,
        density: 1,
        friction: sliders.ground_friction.value,
        restitution: sliders.ground_restitution.value,
        belongsTo: 1,
        collidesWith: 0xffffffff
    });
}

function spawnMaxObjects() {
    let i = sliders.objects_count.value;
    let size = sliders.objects_size.value;
    
    //Na 'levi' polovici talne ploskve
    let x_min = SETTINGS.GROUND_POS.x - (SETTINGS.GROUND_DIMS.x / 3) + size;
    let x_max = 0;

    //Višina
    let y_min = SETTINGS.OBJECTS_SPAWN_HEIGHT.min;
    let y_max = SETTINGS.OBJECTS_SPAWN_HEIGHT.max;

    //Po celotni širini talne ploskve
    let z_min = SETTINGS.GROUND_POS.z - (SETTINGS.GROUND_DIMS.z / 2) + size; 
    let z_max = SETTINGS.GROUND_POS.z + (SETTINGS.GROUND_DIMS.z / 2) - size; 

    while (i--) {

        let position = [randomNumber(x_min, x_max), randomNumber(y_min, y_max), randomNumber(z_min, z_max)]; 
        //Alternate between balls and cubes.
        let body;
        let mesh;
        if (i%2==0) { //Add cube
            body = WORLD.add({
                type: 'box',
                size: [size, size, size],
                pos: position,
                rot: [0, 0, 0],
                move: true,
                density: 1,
                friction: sliders.objects_friction.value,
                restitution: sliders.objects_restitution.value,
                collidesWith: 0xffffffff
            });
            let geometry = new THREE.BoxGeometry(size, size, size);
            let material = new THREE.MeshBasicMaterial({color: randomColorValue()});
            mesh = new THREE.Mesh( geometry, material );
        }
        else { //Add sphere
            body = WORLD.add({
                type: 'sphere',
                size: [size/2, size/2, size/2],
                pos: position,
                rot: [0, 0, 0],
                move: true,
                density: 1,
                friction: sliders.objects_friction.value,
                restitution: sliders.objects_restitution.value,
                collidesWith: 0xffffffff
            });
            let geometry = new THREE.SphereGeometry(size/2, 32, 32);
            let material = new THREE.MeshBasicMaterial({color: randomColorValue()});
            mesh = new THREE.Mesh( geometry, material );
        }
        //Add to scene
        SCENE.add(mesh);
        //Push to lists
        bodys.push(body);
        meshs.push(mesh);
    }
}

function respawnObjects() {
    let i = bodys.length;
    while(i--) {
        bodys[i].remove();
        removeObject3D(meshs[i]);
    }
    bodys = [];
    meshs = [];
    spawnMaxObjects();
}
document.getElementById("respawnBtn").onclick = respawnObjects;

function updateMeshsInScene() {
    for (let i = 0; i < meshs.length; i++) {
        meshs[i].position.copy(bodys[i].getPosition());
        meshs[i].quaternion.copy(bodys[i].getQuaternion());
    }
}

let TESTING = false;
let test_counter = 0;
let test_iterations = 5;
let test_results = []
let test_results_avg = [];
let test_time_length = 12500;
let test_interval = null;
function runTests() {
    TESTING = true;
    test_results = [];
    test_results_avg = [];
    test_counter = 0;
    respawnObjects();
    test_interval = setInterval(function() {
        let sum = test_results.reduce((a, b) => a + b, 0);
        let avg = (sum / test_results.length) || 0;
        test_results_avg.push(avg);
        test_results = [];
        respawnObjects();
        test_counter++;
    }, test_time_length);
}
document.getElementById("runTestBtn").onclick = runTests;

function getFinalTestResults() {
    let sum = test_results_avg.reduce((a, b) => a + b, 0);
    let avg = (sum / test_results_avg.length) || 0;
    let object_count = sliders.objects_count.value;
    alert("Object count: " + object_count + "\n" + "Avg time: " + String(avg));
}

let then = 0;
function animate(now) {
    let fps = Math.round(1000 / (now - then))
    document.getElementById("fpsCounter").innerHTML = fps;
    then = now;
    let startTime = performance.now();
    WORLD.step();
    let endTime = performance.now();
    if(TESTING) {
        let elapsedTime = endTime - startTime //ms
        test_results.push(elapsedTime);
        if(test_counter >= test_iterations) {
            clearInterval(test_interval);
            TESTING = false;
            getFinalTestResults();
        }
    }

    updateMeshsInScene();
    CONTROLS.update();
    RENDERER.render(SCENE, CAMERA);
    requestAnimationFrame(animate);
}

init();
spawnMaxObjects();
requestAnimationFrame(animate);