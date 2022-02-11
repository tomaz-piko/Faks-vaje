class Ball {
    constructor(id, x, y, z, BALL_PARAMS, color) {
        this.id = id;
        this.location = new Vec3(x, y, z);
        this.velocity = new Vec3(0, 0, 0);

        this.isDead = false;
        this.lifeSpan = randomNumber(10, 20);
        this.radius = BALL_PARAMS.r;      
        this.k = BALL_PARAMS.k;
        this.alfa = BALL_PARAMS.alfa;
        this.beta = BALL_PARAMS.beta;
        this.color = color;
    }

    setVelocity(vec3) {
        this.velocity = vec3;
    }

    setLifeSpan(min, max) {
        this.lifeSpan = randomNumber(min, max);
    }

    update(delta_t) {
        this.location.add(Vec3.mult(this.velocity, delta_t));
        this.lifeSpan -= delta_t;
        if(this.lifeSpan <= 0) {
            this.isDead = true;
        }
    }

    applyGravity(delta_t) {
        let gravity = new Vec3(0, -9.81, 0);
        gravity.mult(delta_t);    
        this.velocity.add(gravity);
    }

    applyCollisionWithWall(n) {
        let _n = n.clone();
        _n.normalize();
        let skal_prod = Vec3.mult(this.velocity, _n)   //(v(t) . n)
        let _k = skal_prod * (1 + this.k);        //(1 + k)*(v(t) . n)
        _n.mult(_k);                         //(1 + k)*(v(t) . n)*n
        let v = Vec3.sub(this.velocity, _n);  //v(t) - (vse zgoraj)
        this.setVelocity(v);
    }

    applyCollisionWithBall(ball) {
        let n = Vec3.normalize(Vec3.sub(this.location, ball.location));
        let skal_prod = Vec3.mult(this.velocity, n);
        let k = skal_prod * (1 + this.k);
        n.mult(k);
        let v = Vec3.sub(this.velocity, n);
        this.setVelocity(v);
    }
    
    applyDirectionChange(d) {
        let a = Vec3.mult(this.velocity, (1 - this.beta));
        let b = Vec3.mult(d, this.beta);
        let v2 = Vec3.add(a, b);
        this.setVelocity(v2);
    }
}