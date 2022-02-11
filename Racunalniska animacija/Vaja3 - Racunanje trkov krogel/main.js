let SCENE, CAMERA, RENDERER, CONTROLS, BOX;
let BALLS_LIST = [];

function applySettings() {
    rewriteSettings();
    reinit();
}

function init() {
    //Init renderer
    RENDERER = new THREE.WebGLRenderer({antialias: true});
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas").appendChild(RENDERER.domElement);

    //Init scene
    SCENE = new THREE.Scene();
    //Init camera
    CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //Init orbital controls
    CONTROLS = new THREE.OrbitControls(CAMERA, RENDERER.domElement);
    CAMERA.position.set( 11, 8, 15 );
    CONTROLS.update();

    //Addbox
    createBoundryBox();
}

function reinit() {
    //Delete existing boundry box
    let selectedObject = SCENE.getObjectByName("boundryBox");
    removeObject3D(selectedObject);
    //Create new boundry box
    createBoundryBox();

    //Reset balls
    BALLS_LIST.forEach(ball => {
        deleteBallFromScene(ball);
    });
    BALLS_LIST = [];
    fillBallsList();
}

function createBoundryBox() {
    const geometry = new THREE.BoxGeometry(SETTINGS.BOX_DIMS.X, SETTINGS.BOX_DIMS.Y, SETTINGS.BOX_DIMS.Z);
    const wireframe = new THREE.WireframeGeometry( geometry );
    const line = new THREE.LineSegments(wireframe)
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    line.name = "boundryBox";
    SCENE.add(line);
    line.position.set(SETTINGS.BOX_POS.X, SETTINGS.BOX_POS.Y, SETTINGS.BOX_POS.Z);
    BOX = new BoundryBox(
        new Vec3(SETTINGS.BOX_POS.X, SETTINGS.BOX_POS.Y, SETTINGS.BOX_POS.Z), 
        SETTINGS.BOX_DIMS.X, SETTINGS.BOX_DIMS.Y, SETTINGS.BOX_DIMS.Z
    );
}

function fillBallsList() {
    let spawnMargin = 1.05 * SETTINGS.OBJECT_PARAMS.r;
    for (var i = 0; i < SETTINGS.MAX_BALLS; i++) {
        //Create ball with random position
        let x = randomNumber(BOX.boundries.x_min + spawnMargin, BOX.boundries.x_max - spawnMargin);
        //let y =  BOX.boundries.y_max - spawnMargin; //Prevents clipping
        let y = randomNumber(BOX.boundries.y_min + spawnMargin, BOX.boundries.y_max - spawnMargin);
        let z = randomNumber(BOX.boundries.z_min + spawnMargin, BOX.boundries.z_max - spawnMargin);
        //Generate random color for ball
        let color = randomColorValue();
        let ball = new Ball(String(i), x, y, z, SETTINGS.OBJECT_PARAMS, color);
        if (SETTINGS.VARIATION == 'SOLID') {
            ball.setVelocity(new Vec3(randomNumber(BOX.boundries.x_min, BOX.boundries.x_max), randomNumber(BOX.boundries.y_min/2, BOX.boundries.y_max/2), randomNumber(BOX.boundries.z_min, BOX.boundries.z_max)));
        }
        else if(SETTINGS.VARIATION == 'ELECTRONS') {
            ball.setVelocity(new Vec3(randomNumber(BOX.boundries.x_min, BOX.boundries.x_max), randomNumber(BOX.boundries.y_min*2, 0), randomNumber(BOX.boundries.z_min, BOX.boundries.z_max)));
            //ball.setVelocity(new Vec3(0, -999, 0));
        }
        
        BALLS_LIST.push(ball);

        //Add ball to scene
        const geometry = new THREE.SphereGeometry(SETTINGS.OBJECT_PARAMS.r, 32, 32);
        const material = new THREE.MeshBasicMaterial({color: color});
        const sphere = new THREE.Mesh( geometry, material );
        sphere.name = String(i);
        SCENE.add(sphere)
        sphere.position.set(x, y, z); 
    }
}

function updateBallsList(t) {
    BALLS_LIST.forEach(ball => {
        ball.update(t); //update velocity and location
        updateBallPositionInScene(ball);  
    })      
}

function replaceDeadBall(idx) {
    if(idx < 0 || idx > SETTINGS.MAX_BALLS) {
        return;
    }
    let spawnMargin = 1.05 * SETTINGS.OBJECT_PARAMS.r;
    //Create ball with random position
    let x = randomNumber(BOX.boundries.x_min + spawnMargin, BOX.boundries.x_max - spawnMargin);
    let y =  BOX.boundries.y_max - spawnMargin; //Prevents clipping
    let z = randomNumber(BOX.boundries.z_min + spawnMargin, BOX.boundries.z_max - spawnMargin);
    //Generate random color for ball
    let color = randomColorValue();
    let newBall = new Ball(String(idx), x, y, z, SETTINGS.OBJECT_PARAMS, color);
    if (SETTINGS.VARIATION == 'SOLID') {
        newBall.setVelocity(new Vec3(randomNumber(BOX.boundries.x_min, BOX.boundries.x_max), randomNumber(BOX.boundries.y_min/2, BOX.boundries.y_max/2), randomNumber(BOX.boundries.z_min, BOX.boundries.z_max)));
    }
    else if(SETTINGS.VARIATION == 'ELECTRONS') {
        newBall.setVelocity(new Vec3(randomNumber(BOX.boundries.x_min, BOX.boundries.x_max), randomNumber(BOX.boundries.y_min, BOX.boundries.y_max), randomNumber(BOX.boundries.z_min, BOX.boundries.z_max)));
    }
    BALLS_LIST[idx] = newBall;

    //Add ball to scene
    const geometry = new THREE.SphereGeometry(SETTINGS.OBJECT_PARAMS.r, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: color});
    const sphere = new THREE.Mesh( geometry, material );
    sphere.name = String(idx);
    SCENE.add(sphere)
    sphere.position.set(x, y, z);  
}

window.addEventListener('resize', onWindowResize, false);

function updateBallPositionInScene(ball) {
    var selectedObject = SCENE.getObjectByName(ball.id);
    selectedObject.position.set(ball.location.x, ball.location.y, ball.location.z);
}

function deleteBallFromScene(ball) {
    var selectedObject = SCENE.getObjectByName(ball.id);
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

function animateCollisionsVariation(delta) {
    let t = delta * SETTINGS.SPEED;
    BALLS_LIST.forEach(ball => {
        if(ball.isDead) {
            deleteBallFromScene(ball);
            replaceDeadBall(parseInt(ball.id));
        }
        ball.applyGravity(t);
        for(let ball2 of BALLS_LIST) {
            if(ball.id === ball2.id) continue;
            if(Vec3.mult(Vec3.sub(ball.location, ball2.location), Vec3.sub(ball.velocity, ball2.velocity)) >= 0) continue;
            if(ball.location.dist(ball2.location) <= ball.radius + ball2.radius) { //Collision
                ball.applyCollisionWithBall(ball2);
                ball2.applyCollisionWithBall(ball);
                break;
            }            
        }
        let n = BOX.checkForCollision(ball, t);
        if (n) {
            ball.applyCollisionWithWall(n);
        }  
    });
    updateBallsList(t);
}

let then = 0;
function animate(now) {
    let fps = Math.round(1000 / (now - then));
    document.getElementById("fpsCounter").innerHTML = fps; //Update fps counter
    requestAnimationFrame(animate); 
    const delta = (now - then) * 0.001;
    then = now;
    animateCollisionsVariation(delta);
    CONTROLS.update();
    RENDERER.render(SCENE, CAMERA);
    
}
init();
//Add first batch of balls
fillBallsList();
requestAnimationFrame(animate); 