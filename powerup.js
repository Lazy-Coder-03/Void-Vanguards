class Exp {
    constructor(x, y, val) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 10;
        this.maxForce = 1;
        this.lifespan = 1200;
        this.value = val
    }

    applyForce(force) {
        this.acceleration.add(force.limit(this.maxForce));
    }
    seek(target) {
        let desired = p5.Vector.sub(target, this.position).setMag(this.maxSpeed);
        this.applyForce(p5.Vector.sub(desired, this.velocity).limit(this.maxForce));
    }


    update() {
        this.lifespan -= 1;
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0);

    }

    show() {
        push();
        translate(this.position.x, this.position.y);
        fill(255, this.lifespan);
        noStroke();
        //ellipse(0, 0, 10, 10);
        textSize(16);
        fill(255, this.lifespan);
        textAlign(CENTER, CENTER);
        text("💰", 0, 0);
        pop();
    }
}

class Health {
    constructor(x, y, val) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 10;
        this.maxForce = 1;
        this.lifespan = 1200;
        this.value = val
    }

    applyForce(force) {
        this.acceleration.add(force.limit(this.maxForce));
    }
    seek(target) {
        let desired = p5.Vector.sub(target, this.position).setMag(this.maxSpeed);
        this.applyForce(p5.Vector.sub(desired, this.velocity).limit(this.maxForce));
    }

    update() {
        this.lifespan -= 1;
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0);

    }

    show() {
        push();
        translate(this.position.x, this.position.y);
        fill(0, 255, 0, this.lifespan);
        noStroke();
        //ellipse(0, 0, 10, 10);
        textSize(16);
        fill(255, this.lifespan);
        textAlign(CENTER, CENTER);
        text("❤️", 0, 0);
        pop();
    }
}