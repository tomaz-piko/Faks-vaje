let SCENE, CAMERA, RENDERER, CONTROLS, WORLD;
let BONES = [];
let ANGLES = [];
let sliders;
let chainStartPos = {
    x: 0,
    y: 0
}

let mousePos = {
    x: undefined,
    y: undefined
}

function getMousePosition(e) {
    mousePos.x = e.pageX - Math.round(window.innerWidth/2) + 500;
    mousePos.y = e.pageY - Math.round(window.innerHeight/2) - 250;
    mousePos.y *= -1;
    optimization_IK(ANGLES, mousePos);
    update(ANGLES);
}

document.getElementById("canvas").onmousemove = getMousePosition;

function initThree() {
    //Init renderer
    RENDERER = new THREE.WebGLRenderer({antialias: true});
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas").appendChild(RENDERER.domElement);
    //Init scene
    SCENE = new THREE.Scene();
    SCENE.background = new THREE.Color( 0x2b2d2f );
    //Init camera
    CAMERA = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    CAMERA.position.set( 500, 250, 100 );
    
    const geometry = new THREE.BoxGeometry(1000, 500, 0);
    const wireframe = new THREE.WireframeGeometry( geometry );
    const line = new THREE.LineSegments(wireframe)
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    SCENE.add(line);
    line.position.set(500, 250, 0);
}

function initSliders() {
    var older = document.body;
    sliders = {
        bone_count: new UI.Slide(older, "Bone count:", null, 5, [100, 120, 200, 20], 10, 1, ' '),
        bone_length: new UI.Slide(older, "Bone length:", null, 100, [100, 180, 200, 20], 200, 20, ' '),
        bone_radius: new UI.Slide(older, "Bone radius:", null, 15, [100, 240, 200, 20], 30, 5, ' '),
        d: new UI.Slide(older, "d:", null, 0.1, [100, 300, 200, 20], 1, 0.01, ' ', 2),
        g: new UI.Slide(older, "g:", null, 0.1, [100, 360, 200, 20], 1, 0.01, ' ', 2),
        max_iterations: new UI.Slide(older, "Max iterations:", null, 10, [100, 420, 200, 20], 100, 1, ' ')
    }
}

function init() {
    initThree();
    initSliders();
}

function addBones() {
    let i = BONES.length;
    while(i--) {
        removeObject3D(BONES[i]);
    }
    BONES = [];
    ANGLES = [];
    let max = sliders.bone_count.value;
    let length = sliders.bone_length.value;
    let radius = sliders.bone_radius.value;
    for (i = 0; i < max; i++) {
        const geometry = new THREE.ConeGeometry( radius, length, 32 );
        geometry.translate(0, length/2, 0);
        const material = new THREE.MeshBasicMaterial( {color: randomColorValue()} );
        const bone = new THREE.Mesh( geometry, material );
        bone.position.set(chainStartPos.x, chainStartPos.y + length*i, 0)
        SCENE.add( bone );
        BONES.push(bone);
        ANGLES.push(0);
    }
}

function mark_with_ball(x, y, name) { //For debugging purposes
    //Add ball to scene
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00});
    const sphere = new THREE.Mesh( geometry, material );
    if(name) {
        sphere.name = name;
        deleteBallFromScene(name);
    }
    SCENE.add(sphere)
    sphere.position.set(x, y, 0);
}

function bone_peak(x, y, angle) {
    //Angle in radians!
    let length = sliders.bone_length.value; 
    x += Math.cos(angle) * length;
    y += Math.sin(angle) * length;
    return {'x': x, 'y': y};
}

function err(angles, target) {
    //Target => mousePos = {x: num, y: num};
    let accAngle = 0;
    let pos = {x: 0, y: 0};
    for(let i=0; i < angles.length; i++) {
        let angle = degrees_to_radians(accAngle + angles[i]);
        angle -= Math.PI * i;
        pos = bone_peak(pos.x, pos.y, angle);
        accAngle += angles[i];
    }
    return dist(pos, target);
}

function optimization_IK(angles, target) {
    let gradients = [];
    angles.forEach(() => {
        gradients.push(0);
    })
    let d = sliders.d.value;
    let g = sliders.g.value;
    let max_iterations = sliders.max_iterations.value;
    let counter = 0;
    while(err(angles, target) > d && counter < max_iterations) {
        for(let i = 0; i < angles.length; i++) {
            let anglesA = [...angles];
            let anglesB = [...angles];
            anglesA[i] = anglesA[i] + g;
            anglesB[i] = anglesB[i] - g;
            gradients[i] = err(anglesA, target) - err(anglesB, target);
        }
        //angles = angles - gradients
        for (let i = 0; i < angles.length; i++) {
            angles[i] -= gradients[i];
        }
        counter++;
    }
}

function update(angles) {
    let accAngle = 0;
    let pos = {x: 0, y: 0};
    for(let i=0; i<BONES.length; i++) {
        let angle = degrees_to_radians(accAngle + angles[i]);
        angle -= Math.PI * i;
        BONES[i].rotation.set(0, 0, -Math.PI/2 + angle);
        BONES[i].position.set(pos.x, pos.y, 0);
        pos = bone_peak(pos.x, pos.y, angle);
        accAngle += angles[i];
    }
}

function animate() {
    RENDERER.render(SCENE, CAMERA);
    requestAnimationFrame(animate);
}

init();
addBones();
requestAnimationFrame(animate);