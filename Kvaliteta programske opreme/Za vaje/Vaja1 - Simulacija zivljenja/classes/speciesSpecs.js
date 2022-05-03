function getSpecifications(specie) {
    switch (specie) {
        case 'lion':
            return lion_specifications;
        case 'antilope':
            return antilope_specifications;
        default:
            return default_specifications;
    } 
}

const default_specifications = {
    'specie': 'default',
    'type': 'default',
    'hungerRange': {'min': 0, 'max': 100},
    'thirstRange': {'min': 0, 'max': 100},
    'maxAge': 50,
    'speedRange': {'min': 0, 'max': 100},
    'sizeRange': {'min': 0, 'max': 100},
    'sensRange': 3
}

const lion_specifications = {
    'specie': 'lion',
    'type': 'predator',
    'hungerRange': {'min': 40, 'max': 120},
    'thirstRange': {'min': 40, 'max': 120},
    'maxAge': 40,
    'speedRange': {'min': 50, 'max': 80},
    'sizeRange': {'min': 50, 'max': 120},
    'sensRange': 5
}

const antilope_specifications = {
    'specie': 'antilope',
    'type': 'prey',
    'hungerRange': {'min': 30, 'max': 100},
    'thirstRange': {'min': 30, 'max': 100},
    'maxAge': 30,
    'speedRange': {'min': 50, 'max': 120},
    'sizeRange': {'min': 50, 'max': 80},
    'sensRange': 3
}