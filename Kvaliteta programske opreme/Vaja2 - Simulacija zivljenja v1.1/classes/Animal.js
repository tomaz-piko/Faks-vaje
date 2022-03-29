class Animal {
    constructor(hungerLevel, thirstLevel, reprodLevel, age, sex, speed, size, sensRange, type) {
        this.hungerLevel = hungerLevel;
        this.thirstLevel = thirstLevel;
        this.reprodLevel = reprodLevel;
        this.age = age;
        this.sex = sex;
        this.speed = speed;
        this.size = size;
        this.sensRange = sensRange;
        this.type = type;
        this.position = {row: undefined, col: undefined};
    }

    updateAge() {
        this.age += 1;
    }
}