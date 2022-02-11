class Vehicle {
    constructor(x, y, id) {
        //Vehicle vectors
        this.location = new PVector(x, y);
        this.velocity = new PVector(0, 0);
        this.acceleration = new PVector(0, 0);

        //Vehicle limitations
        this.maxForce = defaultMaxForce;
        this.maxSpeed = defaultMaxSpeed;

        //Vehicle id
        this.id = id;

        //Triangle display parameters
        this.w = 10;
        this.l = 20;

        //Circle display parameter
        this.r = 5;       
    }
 
    setAcceleration(v) {
        this.acceleration = v;
    }

    setRandAccel(min, max) {
        this.acceleration = new PVector(randomBetween(min, max), randomBetween(min, max));
    }

    setMaxForce(max) {
        this.maxForce = max;
    }

    setMaxSpeed(max) {
        this.maxSpeed = max;
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
    }

    /*------------HELPER FUNCTIONS------------*/  
    display(shape) {
        if (shape == "TRIANGLE") {
            ctx.save();
            ctx.translate(this.location.x, this.location.y);
            let theta = this.velocity.heading() + Math.PI/2;
            ctx.rotate(theta);       
            ctx.beginPath();
            ctx.moveTo(0, 0)
            ctx.lineTo(this.w/2, this.l);
            ctx.lineTo(-this.w/2, this.l);
            ctx.fill();   
            ctx.translate(-this.location.x, -this.location.y);
            ctx.restore();
        }
        else if (shape == "CIRCLE") {
            ctx.beginPath();
            ctx.arc(this.location.x, this.location.y, this.r, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    checkEdges() {
        if(this.location.x >= canvas.width) {
            this.location.x = 0;
        }
        else if(this.location.x < 0) {
            this.location.x = canvas.width;
        }
        if(this.location.y >= canvas.height) {
            this.location.y = 0;
        }
        else if(this.location.y < 0) {
            this.location.y = canvas.height;
        }
    }

    map(currdist, mindist, maxdist, minspeed, maxspeed) {
        return (currdist / maxdist)*maxspeed;
    }
    /*----------------------------------------*/  

    /*------------SOLO CONCEPTS------------*/
    seek(target) {   
        let desired = PVector.sub(target, this.location);
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = PVector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer
    }

    stayWithinWalls(thickness) {
        let desired = new PVector(this.velocity.x, this.velocity.y);
        if (this.location.x < thickness) {
            desired.x = this.maxSpeed;
        }
        else if (this.location.x > canvas.width - thickness) {
            desired.x = -this.maxSpeed;
        }
        if (this.location.y < thickness) {
            desired.y = this.maxSpeed;
        }
        else if (this.location.y > canvas.height - thickness) {
            desired.y = -this.maxSpeed;
        }
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = PVector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer
    }

    wander(radius, stepsAhead) {  
        this.checkEdges();     
        let tmp = new PVector(this.velocity.x, this.velocity.y)
        tmp.mult(stepsAhead);
        let target = PVector.add(this.location, tmp); //za "stepsAhead korake" naprej
        let angle = Math.random()*Math.PI*2;
        let x = target.x + Math.cos(angle)*radius;
        let y = target.y + Math.sin(angle)*radius;
        target = new PVector(x, y);
        let desired = PVector.sub(target, this.location);
        if(document.getElementById("wandererTargetCheck").checked) {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = PVector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer
    }     

    arrive(target, brakeradius) {
        let desired = PVector.sub(target, this.location);
        let currdistance = desired.mag();
        desired.normalize();
        if (currdistance < brakeradius) {
            let m = this.map(currdistance, 0, brakeradius, 0, this.maxSpeed);
            desired.mult(m);
        }
        else {
            desired.mult(this.maxSpeed);
        }
        let steer = PVector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        return steer
    }
    /*--------------------------------------*/

    /*------------GROUP CONCEPTS------------*/
    separate(others) {
        let desiredSeparation = defaultDesiredSeparation;
        let sum = new PVector(0, 0);
        let count = 0;

        others.forEach(other => {

            let d = PVector.dist(this.location, other.location);
            if(d < desiredSeparation) {
                let diff = PVector.sub(this.location, other.location);
                diff.normalize();
                sum.add(diff);
                count++;
            }
        })

        if(count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed);
            let steer = PVector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer
        }else {return new PVector(0, 0);}
    }

    align(others) {
        let sum = new PVector(0, 0);
        others.forEach(other => {
            sum.add(other.velocity);
        })
        if(others.length > 0) {
            sum.div(others.length);
        }        
        sum.setMag(this.maxSpeed);
        let steer = PVector.sub(sum, this.velocity);
        steer.limit(this.maxForce);
        return steer
    }

    cohesion(others) {
        let minDist = defaultCohesionMinDist;
        let sum = new PVector(0, 0);
        let count = 0;
        others.forEach(other => {
            let d = PVector.dist(this.location, other.location);
            if(d < minDist) {
                sum.add(other.location);
                count++;
            }
        })
        if (count > 0) {
            sum.div(count);
            return this.seek(sum)
        }else {return new PVector(0, 0);}
    }
    /*--------------------------------------*/

    flock(vehicles) {
        this.checkEdges();
        let others = vehicles.filter(v2 => v2.id != this.id);
        let sep = this.separate(others);
        let ali = this.align(others);
        let coh = this.cohesion(others);

        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }
}