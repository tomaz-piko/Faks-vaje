let STATISTICS = "Prey Count;Prey Hunger;Prey Thirst;Prey Speed;Prey Size;Prey Age;" +
    "Predator Count;Predator Hunger;Predator Thirst;Predator Speed;Predator Size;Predator Age\n";

function exportStatistics() {
    const fileName = 'statistics.txt';   
    const data = STATISTICS;
    const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([STATISTICS], {
        type: "text/plain"
    }));
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function extractStatistics(entities) {
    // Calculate averages for prey
    let preys = entities.animals.filter(animal => animal.type === 'prey');
    let preyCount = preys.length;
    let preyHungerAvg, preyThirstAvg, preySpeedAvg, preySizeAvg, preyAgeAvg;
    preyHungerAvg = preyThirstAvg = preySpeedAvg = preySizeAvg = preyAgeAvg = 0;
    preys.forEach(prey => {
        preyHungerAvg += prey.hunger;
        preyThirstAvg += prey.thirst;
        preySpeedAvg += prey.speed;
        preySizeAvg += prey.size;
        preyAgeAvg += prey.age;
    });
    preyHungerAvg /= preyCount;
    preyThirstAvg /= preyCount;
    preySpeedAvg /= preyCount;
    preySizeAvg /= preyCount;
    preyAgeAvg /= preyCount;

    // Calculate averages for predators
    let predators = entities.animals.filter(animal => animal.type === 'predator');
    let predatorCount = predators.length;
    let predatorHungerAvg, predatorThirstAvg, predatorSpeedAvg, predatorSizeAvg, predatorAgeAvg;
    predatorHungerAvg = predatorThirstAvg = predatorSpeedAvg = predatorSizeAvg = predatorAgeAvg = 0;
    predators.forEach(predator => {
        predatorHungerAvg += predator.hunger;
        predatorThirstAvg += predator.thirst;
        predatorSpeedAvg += predator.speed;
        predatorSizeAvg += predator.size;
        predatorAgeAvg += predator.age;
    })
    predatorHungerAvg /= predatorCount;
    predatorThirstAvg /= predatorCount;
    predatorSpeedAvg /= predatorCount;
    predatorSizeAvg /= predatorCount;
    predatorAgeAvg /= predatorCount;

    let csvString = 
        preyCount + ';' +
        preyHungerAvg + ';' +
        preyThirstAvg + ';' +
        preySpeedAvg + ';' +
        preySizeAvg + ';' +
        preyAgeAvg + ';' +
        predatorCount + ';' +
        predatorHungerAvg + ';' +
        predatorThirstAvg + ';' +
        predatorSpeedAvg + ';' +
        predatorSizeAvg + ';' +
        predatorAgeAvg + '\n';
    STATISTICS = STATISTICS.concat(csvString);
}