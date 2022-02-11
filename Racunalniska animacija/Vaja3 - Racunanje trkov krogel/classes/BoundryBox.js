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

    checkIfCloseToWall(object) {
        //Check top and bottom collisions
        let margin = 4/5*this.a;
        if (object.location.y <= this.boundries.y_min + margin) {
            return new Vec3(0, this.boundries.y_min, 0);
        }
        else if(object.location.y >= this.boundries.y_max - margin) {
            return new Vec3(0, this.boundries.y_max, 0);
        }
        //Check front and back collisions
        else if (object.location.z  <= this.boundries.z_min + margin) {
            return new Vec3(0, 0, this.boundries.z_min);
        }
        else if(object.location.z >= this.boundries.z_max - margin) {
            return new Vec3(0, 0, this.boundries.z_max);
        }
        //Check left and right collisions
        else if (object.location.x  <= this.boundries.x_min + margin) {
            return new Vec3(this.boundries.x_min, 0, 0);
        }
        else if(object.location.x  >= this.boundries.x_max - margin) {
            return new Vec3(this.boundries.x_max, 0, 0);
        }
        return undefined;
    }

    checkIfCloseToWall2(object) {
        //Check top and bottom collisions
        let margin = object.radius*1.5;
        let d = new Vec3(0, 0, 0);
        if (object.location.y <= this.boundries.y_min + margin) {
            d.y = this.boundries.y_min;
        }
        else if(object.location.y >= this.boundries.y_max - margin) {
            d.y = this.boundries.y_max;
        }
        //Check front and back collisions
        if (object.location.z  <= this.boundries.z_min + margin) {
            d.z = this.boundries.z_min;
        }
        else if(object.location.z >= this.boundries.z_max - margin) {
            d.z = this.boundries.z_max;
        }
        //Check left and right collisions
        if (object.location.x  <= this.boundries.x_min + margin) {
            d.x = this.boundries.x_min;
        }
        else if(object.location.x  >= this.boundries.x_max - margin) {
            d.x = this.boundries.x_max;
        }
        return d;
    }

    /*checkIfCloseToWall(object) {
        let MARGIN = object.radius*2;
        let d = new Vec3(0, 0, 0);
        //Check top and bottom collisions
        if(object.location.y <= this.boundries.y_min + MARGIN) {
            let st = object.location.y - this.boundries.y_min;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.add(new Vec3(0, st/im, 0));
        }
        else if(object.location.y >= this.boundries.y_max - MARGIN) {
            let st = object.location.y - this.boundries.y_max;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.add(new Vec3(0, st/im, 0));
        }
        //Check front and back collisions
        else if(object.location.z <= this.boundries.z_min + MARGIN) {
            let st = object.location.z - this.boundries.z_min;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.add(new Vec3(0, 0, st/im));
        }
        else if(object.location.z >= this.boundries.z_max - MARGIN) {
            let st = object.location.z - this.boundries.z_max;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.add(new Vec3(0, 0, st/im));
        }
        //Check left and right collisions
        else if(object.location.x <= this.boundries.x_min + MARGIN) {
            let st = object.location.x - this.boundries.x_min;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.add(new Vec3(st/im, 0, 0));
        }
        else if(object.location.x >= this.boundries.x_max - MARGIN) {
            let st = object.location.x - this.boundries.x_max;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.add(new Vec3(st/im, 0, 0));
        }
        return d;
    }*/

    nekiNovga(object) {
        let d = new Vec3(0, 0, 0)
        if (object.location.y < this.boundries.y_min) {
            let st = object.location.y - this.boundries.y_min;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.y = st/im;
        }
        else if(object.location.y > this.boundries.y_max) {
            let st = object.location.y - this.boundries.y_max;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.y = st/im;
        }
        //Check front and back collisions
        if (object.location.z < this.boundries.z_min) {
            let st = object.location.y - this.boundries.z_min;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.z = st/im;
        }
        else if(object.location.z > this.boundries.z_max) {
            let st = object.location.y - this.boundries.z_max;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.z = st/im;
        }
        //Check left and right collisions
        if (object.location.x < this.boundries.x_min) {
            let st = object.location.y - this.boundries.x_min;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.x = st/im;
        }
        else if(object.location.x > this.boundries.x_max) {
            let st = object.location.y - this.boundries.x_max;
            let im = Math.pow(Math.sqrt(st*st) + 1, object.alfa);
            d.x = st/im;
        }
        return d;
    }
}