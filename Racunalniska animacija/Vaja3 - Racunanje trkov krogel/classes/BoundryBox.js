class BoundryBox {
    constructor(pos, a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;

        let A = new Vec3(pos.x + -a/2, pos.y + -b/2, pos.z + c/2);
        let B = new Vec3(pos.x + a/2, pos.y + -b/2, pos.z + c/2);
        let C = new Vec3(pos.x + a/2, pos.y + -b/2, pos.z + -c/2); 
        let D = new Vec3(pos.x + -a/2, pos.y + -b/2, pos.z + -c/2);
        let E = new Vec3(pos.x + -a/2, pos.y + b/2, pos.z + c/2); 
        let F = new Vec3(pos.x + a/2, pos.y + b/2, pos.z + c/2);
        let G = new Vec3(pos.x + a/2, pos.y + b/2, pos.z + -c/2);
        let H = new Vec3(pos.x + -a/2, pos.y + b/2, pos.z + -c/2);

        this.vertices = {
            'A': A,
            'B': B,
            'C': C,
            'D': D,
            'E': E,
            'F': F,
            'G': G,
            'H': H
        }

        this.vectors = {
            'AB': Vec3.sub(B, A),
            'BC': Vec3.sub(C, B),
            'CD': Vec3.sub(D, C),
            'AD': Vec3.sub(D, A),
            'EF': Vec3.sub(F, E),
            'FG': Vec3.sub(G, F),
            'GH': Vec3.sub(H, G),
            'EH': Vec3.sub(H, E),
            'AE': Vec3.sub(E, A),
            'BF': Vec3.sub(F, B),
            'CG': Vec3.sub(G, C),
            'DH': Vec3.sub(H, D),
        }

        this.normals = {
            'bottom': Vec3.normalize(Vec3.dot(this.vectors['AB'], this.vectors['AD'])),
            'top': Vec3.normalize(Vec3.dot(this.vectors['EH'], this.vectors['EF'])),
            'back': Vec3.normalize(Vec3.dot(this.vectors['CG'], this.vectors['GH'])),
            'front': Vec3.normalize(Vec3.dot(this.vectors['AE'], this.vectors['AB'])),
            'left': Vec3.normalize(Vec3.dot(this.vectors['AD'], this.vectors['DH'])),
            'right': Vec3.normalize(Vec3.dot(this.vectors['BF'], this.vectors['BC']))
        }

        this.boundries = {
            'y_max': pos.y + b/2,
            'y_min': pos.y - b/2,
            'z_max': pos.z + c/2,
            'z_min': pos.z - c/2,
            'x_max': pos.x + a/2,
            'x_min': pos.x - a/2
        }
    }

    checkForCollision(object, delta) {
        let newLoc = object.location.clone();
        newLoc.add(Vec3.mult(object.velocity, delta));
        //Check top and bottom collisions
        if (newLoc.y - object.radius <= this.boundries.y_min) {
            return this.normals.bottom;
        }
        else if(newLoc.y + object.radius >= this.boundries.y_max) {
            return this.normals.top;
        }
        //Check front and back collisions
        else if (newLoc.z - object.radius <= this.boundries.z_min) {
            return this.normals.back;
        }
        else if(newLoc.z + object.radius >= this.boundries.z_max) {
            return this.normals.front;
        }
        //Check left and right collisions
        else if (newLoc.x - object.radius <= this.boundries.x_min) {
            return this.normals.left;
        }
        else if(newLoc.x + object.radius >= this.boundries.x_max) {
            return this.normals.right;
        }
        return undefined;
    }
}