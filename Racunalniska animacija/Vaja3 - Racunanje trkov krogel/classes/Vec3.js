class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    add(vec) {
        if (vec instanceof Vec3) {
            this.x += vec.x;
            this.y += vec.y;
            this.z += vec.z;
        }
        else {
            this.x += vec;
            this.y += vec;
            this.z += vec;
        }
    }

    static add(a, b) {
        if (!(a instanceof Vec3)) {
            throw "add(a, b): {a} must be type of Vec3.";
        }
        if (b instanceof Vec3) {
            return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
        }
        else {
            return new Vec3(a.x + b, a.y + b, a.z + b);
        }
    }

    sub(vec) {
        if (vec instanceof Vec3) {
            this.x -= vec.x;
            this.y -= vec.y;
            this.z -= vec.z;
        }
        else {
            this.x -= vec;
            this.y -= vec;
            this.z -= vec;
        }
    }

    static sub(a, b) {
        if (!(a instanceof Vec3)) {
            throw "add(a, b): {a} should be type of Vec3.";
        }
        if (b instanceof Vec3) {
            return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
        }
        else {
            return new Vec3(a.x - b, a.y - b, a.z - b);
        }
    }

    mult(n) {
        this.x = this.x * n;
        this.y = this.y * n;
        this.z = this.z * n;
    }

    static mult(a, b) {
        if (!(a instanceof Vec3)) {
            throw "add(a, b): {a} must be type of Vec3.";
        }
        if (b instanceof Vec3) {
            return ((a.x*b.x) + (a.y*b.y) + (a.z*b.z)); //Skalarni produkt
        }
        else {
            return new Vec3(a.x*b, a.y*b, a.z*b); //Množenje s skalarjem
        }
    }

    div(n) {
        this.x = this.x / n;
        this.y = this.y / n;
        this.z = this.z / n;
    }

    static div(a, skalar) {
        if (!(a instanceof Vec3)) {
            throw "add(a, b): {a} must be type of Vec3.";
        }
        return new Vec3(a.x / skalar, a.y / skalar, a.z / skalar);
    }

    mag() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }

    normalize() {
        let m = this.mag();
        if (m != 0) {
            this.div(m);
        }
    }

    static normalize(v) {
        if (!(v instanceof Vec3)) {
            throw "normalize(v): {v} must be type of Vec3."
        }
        let _n = v.clone();
        _n.normalize();
        return _n;
    }

    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
    }

    static dot(a, b) {
        if(!(a instanceof Vec3) || !(b instanceof Vec3)) {
            throw "dot(a, b): {a} and {b} must be type of Vec3."
        }
        return new Vec3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x); //Vektorski produkt
    }

    dist(v) {
        if (!(v instanceof Vec3)) {
            throw "dist(v): {v} must be type of Vec3."
        }
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    replaceWithNonZero(vec) {
        if(vec.x != 0) this.x = vec.x;
        if(vec.y != 0) this.y = vec.y;
        if(vec.z != 0) this.z = vec.z; 
    } 
}