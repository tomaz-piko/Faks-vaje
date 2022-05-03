class Plant {
    constructor(type, hungerRestoration, row, col, id) {
        this.type = type;
        this.age = 0;
        this.maxAge = randomInteger(5, 20);
        this.hungerRestoration = hungerRestoration;
        this.isDead = false;
        this.position = {row, col};
        this.id = id;
    }

    grow() {
        this.age += 1;
        if(this.age < maxAge) {
            this.hungerRestoration += 1;
        }
        else {
            this.isDead = true;
        }
    }

    kill() {
        this.isDead = true;
    }
}