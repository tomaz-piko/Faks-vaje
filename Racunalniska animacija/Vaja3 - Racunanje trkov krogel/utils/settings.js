let SETTINGS = {
    'SPEED': parseFloat(document.getElementById("speedValue").value),
    'MAX_BALLS': parseInt(document.getElementById("ballCount").value),
    'OBJECT_PARAMS': {
        'r': parseFloat(document.getElementById("ballRadius").value),
        'k': parseFloat(document.getElementById("bounceFactor").value),
        'alfa': parseFloat(document.getElementById("alfaFactor").value),
        'beta': parseFloat(document.getElementById("betaFactor").value)
    },
    'BOX_DIMS': {
        'X': parseInt(document.getElementById("constraintX").value),
        'Y': parseInt(document.getElementById("constraintY").value),
        'Z': parseInt(document.getElementById("constraintZ").value)
    },
    'BOX_POS': {
        'X': 0,
        'Y': 0,
        'Z': 0
    }
}

function rewriteSettings() {
    SETTINGS = {
        'SPEED': parseFloat(document.getElementById("speedValue").value),
        'MAX_BALLS': parseInt(document.getElementById("ballCount").value),
        'OBJECT_PARAMS': {
            'r': parseFloat(document.getElementById("ballRadius").value),
            'k': parseFloat(document.getElementById("bounceFactor").value),
            'alfa': parseFloat(document.getElementById("alfaFactor").value),
            'beta': parseFloat(document.getElementById("betaFactor").value)
        },
        'BOX_DIMS': {
            'X': parseInt(document.getElementById("constraintX").value),
            'Y': parseInt(document.getElementById("constraintY").value),
            'Z': parseInt(document.getElementById("constraintZ").value)
        },
        'BOX_POS': {
            'X': 0,
            'Y': 0,
            'Z': 0
        }
    }
}