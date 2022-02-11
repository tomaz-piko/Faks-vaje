class PVector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    static add(a, b) {
        return new PVector(a.x + b.x, a.y + b.y);
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    static sub(a, b) {
        return new PVector(a.x - b.x, a.y - b.y);
    }

    mult(n) {
        this.x =  this.x * n;
        this.y =  this.y * n;
    }

    div(n) {
        this.x =  this.x / n;
        this.y =  this.y / n;
    }

    mag() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    setMag(n) {
        this.normalize();
        this.mult(n);
    }

    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
    }

    normalize() {
        let m = this.mag()
        if (m != 0) {
            this.div(m);
        }
    }

    heading() {
        return Math.atan2(this.y, this.x);
    }

    dist(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    static dist(a, b) {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return Math.sqrt(dx*dx + dy*dy);
    }
}