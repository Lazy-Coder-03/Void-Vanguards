class Exp {
    constructor(x, y, val) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 10;
        this.maxForce = 1;
        this.lifespan = xpOrbLifeSpan;
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
        if (this.lifespan <= 0) {
            this.lifespan = 0;
        }
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0);

    }

    show() {
        push();
        translate(this.position.x, this.position.y);

        // Smooth transition for size
        let size = map(this.lifespan, 0, xpOrbLifeSpan, 10, 48);  // Start from a minimum size (e.g., 10) instead of 0
        let imgWid = orbIcon.width;
        let imgHei = orbIcon.height;
        let aspectRatio = imgWid / imgHei;
        let drawWidth = size * aspectRatio;
        let drawHeight = size;

        // Display the orbIcon with the fading effect
        imageMode(CENTER);
        fill(255, this.lifespan);
        image(orbIcon, 0, 0, drawWidth, drawHeight);
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
        this.lifespan = healthOrbLifeSpan;
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

        // Smooth transition for size
        let size = map(this.lifespan, 0, healthOrbLifeSpan, 10, 48);  // Start from a minimum size (e.g., 10) instead of 0
        let imgWid = heartIcon.width;
        let imgHei = heartIcon.height;
        let aspectRatio = imgWid / imgHei;
        let drawWidth = size * aspectRatio;
        let drawHeight = size;

        // Display the heartIcon with the fading effect
        imageMode(CENTER);
        fill(255, this.lifespan);
        image(heartIcon, 0, 0, drawWidth, drawHeight);
        pop();
    }
}