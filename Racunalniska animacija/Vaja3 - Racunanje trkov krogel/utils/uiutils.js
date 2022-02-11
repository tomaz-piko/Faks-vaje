function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

function decreaseBallCount() {
    var curr = document.getElementById("ballCount").value;
    document.getElementById("ballCount").value = parseInt(curr) - 1;
}

function increaseBallCount() {
    var curr = document.getElementById("ballCount").value;
    document.getElementById("ballCount").value = parseInt(curr) + 1;
}

function decreaseBallRadius() {
    var curr = document.getElementById("ballRadius").value;
    document.getElementById("ballRadius").value = roundToMinDecimals(parseFloat(curr) - 0.1, 2);
}

function increaseBallRadius() {
    var curr = document.getElementById("ballRadius").value;
    document.getElementById("ballRadius").value = roundToMinDecimals(parseFloat(curr) + 0.1, 2);
}

function decreaseSpeed() {
    var curr = document.getElementById("speedValue").value;
    document.getElementById("speedValue").value = roundToMinDecimals(parseFloat(curr) - 0.25, 3);
}

function increaseSpeed() {
    var curr = document.getElementById("speedValue").value;
    document.getElementById("speedValue").value = roundToMinDecimals(parseFloat(curr) + 0.25, 3);
}

function decreaseBounceFactor() {
    var curr = document.getElementById("bounceFactor").value;
    document.getElementById("bounceFactor").value = roundToMinDecimals(parseFloat(curr) - 0.05, 3);
}

function increaseBounceFactor() {
    var curr = document.getElementById("bounceFactor").value;
    document.getElementById("bounceFactor").value = roundToMinDecimals(parseFloat(curr) + 0.05, 3);
}

function decreaseAlfaFactor() {
    var curr = document.getElementById("alfaFactor").value;
    document.getElementById("alfaFactor").value = roundToMinDecimals(parseFloat(curr) - 0.05, 3);
}

function increaseAlfaFactor() {
    var curr = document.getElementById("alfaFactor").value;
    document.getElementById("alfaFactor").value = roundToMinDecimals(parseFloat(curr) + 0.05, 3);
}

function decreaseBetaFactor() {
    var curr = document.getElementById("betaFactor").value;
    document.getElementById("betaFactor").value = roundToMinDecimals(parseFloat(curr) - 0.01, 3);
}

function increaseBetaFactor() {
    var curr = document.getElementById("betaFactor").value;
    document.getElementById("betaFactor").value = roundToMinDecimals(parseFloat(curr) + 0.01, 3);
}