var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');
var canvasCenterH = Math.round(canvas.height/2);
var canvasCenterW = Math.round(canvas.width/2);
var vehicles = [];

var defaultMaxForce = 0.1;
var defaultMaxSpeed = 3;
var defaultBrakeRadius = 100;
var defaultWallThickness = 25;
var defaultWanderRadius = 75;
var defaultWanderLookAhead = 50;
var defaultDesiredSeparation = 25;
var defaultCohesionMinDist = 200;

document.getElementById("maxForceInput").value = defaultMaxForce;
document.getElementById("maxSpeedInput").value = defaultMaxSpeed;

document.getElementById("brakeRadiusInput").value = defaultBrakeRadius;
document.getElementById("wallThicknessInput").value = defaultWallThickness;
document.getElementById("wanderRadiusInput").value = defaultWanderRadius;
document.getElementById("wanderLookAheadInput").value = defaultWanderLookAhead;
document.getElementById("desiredSeparationInput").value = defaultDesiredSeparation;
document.getElementById("cohesionMinDistInput").value = defaultCohesionMinDist;

function toDegrees(radians) {
    return radians * (180/Math.PI);
}

function toRadians(degrees) {
    return degrees * (Math.PI/180);
}

function randomBetween(min, max) {
    if (min < 0) {
        return min + Math.random() * (Math.abs(min)+max);
    }else {
        return min + Math.random() * max;
    }
}

function AddVehicle(x, y) {
    let veh = new Vehicle(x, y, vehicles.length);
    vehicles.push(veh);
    return veh
}

var displayShape = "CIRCLE";
var MODE = "FLOCK";
var placementNum = 1;
var mouseLoc = null;
var target = new PVector(25, 25);

canvas.addEventListener('mousemove', (event) => {
    mouseLoc = new PVector(event.clientX-50, event.clientY-50);
});

canvas.addEventListener('mousedown', (event) => {
    for (let i = 0; i < placementNum; i++) {
        let loc = new PVector(event.clientX-50, event.clientY-50);
        let veh = AddVehicle(loc.x, loc.y, vehicles.length);
        veh.setRandAccel(-0.5, 0.5);
    }  
});

setInterval(function() {
    if(mouseLoc) {
        target = mouseLoc;
    }   
}, 25)

function ClearAndUpdate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let steer = null;
    vehicles.forEach(v => {
        v.update();
        switch (MODE) {
            case "SEEK":
                steer = v.seek(target);
                v.applyForce(steer);
                break;
            case "ARRIVE":
                steer = v.arrive(target, defaultBrakeRadius);
                v.applyForce(steer);
                break;
            case "STAYWITHINWALLS": 
                steer = v.stayWithinWalls(defaultWallThickness);
                v.applyForce(steer);
                break;
            case "WANDER":
                steer = v.wander(defaultWanderRadius, defaultWanderLookAhead);
                v.applyForce(steer);
                break;
            case "SEPARATE":
                v.checkEdges();
                steer = v.separate(vehicles.filter(v2 => v2.id != v.id));
                v.applyForce(steer);
                break;
            case "ALIGN":
                v.checkEdges();
                steer = v.align(vehicles.filter(v2 => v2.id != v.id));
                v.applyForce(steer);
                break;
            case "COHESION":
                v.checkEdges();
                steer = v.cohesion(vehicles.filter(v2 => v2.id != v.id));
                v.applyForce(steer);
                break;
            default:
                v.flock(vehicles);
                break;
        }            
        v.display(displayShape);   
    });

    window.requestAnimationFrame(ClearAndUpdate);
}

ClearAndUpdate();

function changeShape(shape) {
    displayShape = shape;
}

function increasePlacementNum() {
    placementNum += 1;
    document.getElementById("placementNumInput").value = placementNum.toString();
}

function decreasePlacementNum() {
    placementNum -= 1;
    if(placementNum == 0) {
        placementNum = 1;
    }
    document.getElementById("placementNumInput").value = placementNum.toString();
}

function setSelectedMode() {
    MODE = document.getElementById("modeSelectInput").value;
}

function applyOptionsToAll() {
    vehicles.forEach(v => {
        v.maxForce = defaultMaxForce;
        v.maxSpeed = defaultMaxSpeed;
    })
}

function deleteAllVehichles() {
    vehicles = [];
}

function setMaxForce(val) {
    defaultMaxForce = parseFloat(val);
}

function setMaxSpeed(val) {
    defaultMaxSpeed = parseFloat(val);
}

function setBrakeRadius(val) {
    defaultBrakeRadius = parseFloat(val);
}

function setWallThickness(val) {
    defaultWallThickness = parseFloat(val);
}

function setWanderRadius(val) {
    defaultWanderRadius = parseFloat(val);
}

function setWanderLookAhead(val) {
    defaultWanderLookAhead = parseFloat(val);
}

function setDesiredSeparation(val) {
    defaultDesiredSeparation = parseFloat(val);
}

function setCohesionMinDist(val) {
    defaultCohesionMinDist = parseFloat(val);
}