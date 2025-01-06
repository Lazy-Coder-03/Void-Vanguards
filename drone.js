class Drone {
    static MAX_HEALTH = 30;
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 2;
        this.maxForce = 0.1;
        this.rotation = 0; // Current rotation angle
        this.targetRotation = 0; // Desired rotation angle
        this.rotationSpeed = 0.1; // Speed of rotation adjustment
        this.friction = 0.07;
        this.bps = 2; // Bullets per second
        this.lastShotTime = 0;
        this.collectionRadius = 100
        this.getexpRadius = 20
        this.damage = 30;
        this.health = 30;
    }

    update() {
        keyIsDownHandler();
        if (this.health <= 0) {
            this.health = 0;
        }
        if (millis() - this.lastShotTime > 1000 / this.bps) {
            this.shootBullet();
            this.lastShotTime = millis();
        }

        // Apply friction if no acceleration
        if (this.acceleration.mag() === 0) {
            this.velocity.mult(1 - this.friction);
        }

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        this.acceleration.set(0, 0);

        // Gradually rotate towards the target rotation
        let deltaAngle = this.targetRotation - this.rotation;
        if (deltaAngle > PI) deltaAngle -= TWO_PI;
        if (deltaAngle < -PI) deltaAngle += TWO_PI;
        this.rotation += constrain(deltaAngle, -this.rotationSpeed, this.rotationSpeed);
    }

    applyForce(x, y) {
        let force = createVector(x, y).limit(this.maxForce);
        this.acceleration.add(force);
    }

    faceClosestEnemy(enemies) {
        let closestEnemy = this.findClosestEnemy(enemies);
        if (closestEnemy) {
            let desired = p5.Vector.sub(closestEnemy.position, this.position).normalize();
            this.targetRotation = atan2(desired.y, desired.x);
        }
    }

    findClosestEnemy(enemies) {
        let closest = null;
        let closestDist = Infinity;
        for (let enemy of enemies) {
            let d = this.position.dist(enemy.position);
            if (d < closestDist) {
                closestDist = d;
                closest = enemy;
            }
        }
        return closest;
    }

    shootBullet() {
        bullets.push(new Bullet(this.position.x, this.position.y, this.rotation, this.damage));
    }

    show() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation + PI / 2);
        fill(15, 148, 36);
        noStroke();
        beginShape();
        vertex(10, 10);
        vertex(-10, 10);
        vertex(0, -20);
        endShape(CLOSE);
        stroke(255);
        strokeWeight(2);
        line(0, 0, 0, -25);
        noFill();
        stroke(128, 128, 0, 100);
        ellipse(0, 0, this.collectionRadius * 2, this.collectionRadius * 2);
        pop();
    }
}