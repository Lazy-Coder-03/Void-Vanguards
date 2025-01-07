class Bullet {
    constructor(x, y, angle, damage) {
        this.position = createVector(x, y);
        this.initialPosition = createVector(x, y); // Store the initial position of the bullet
        this.velocity = p5.Vector.fromAngle(angle).mult(10);
        this.damage = damage;
        this.isOffScreenDist = 600;

        // Store previous positions for the trail
        this.trail = [];
        this.maxTrailLength = 10; // Maximum number of trail points
    }

    update() {
        // Update bullet position
        this.position.add(this.velocity);

        // Add current position to trail
        this.trail.push(this.position.copy());

        // Limit the trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift(); // Remove the oldest trail point
        }
    }

    show() {
        // Draw the trail
        // push();
        // noFill();
        // stroke(50, 255, 78, 100); // Semi-transparent trail
        // strokeWeight(2);
        // beginShape();
        // for (let i = 0; i < this.trail.length; i++) {
        //     let alpha = map(i, 0, this.trail.length - 1, 0, 255); // Fading effect
        //     stroke(50, 255, 78, alpha); // Gradual fading
        //     vertex(this.trail[i].x, this.trail[i].y);
        // }
        // endShape();
        // pop();

        // Draw the bullet
        push();
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + PI / 2);
        fill(50, 255, 78);
        noStroke();
        ellipse(0, 0, 2, 20); // Adjust bullet size if needed
        pop();
    }

    // Check if the bullet has traveled a certain distance
    isOffScreen() {
        let distanceTraveled = this.position.dist(this.initialPosition);
        return distanceTraveled > this.isOffScreenDist; // Remove bullet after it travels a certain distance
    }

    hits(enemy) {
        return dist(this.position.x, this.position.y, enemy.position.x, enemy.position.y) < 10;
    }
}
