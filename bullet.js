class Bullet {
    static MAX_SPEED = 15;

    constructor(x, y, angle, damage) {
        this.position = createVector(x, y);
        this.initialPosition = createVector(x, y); // Store the initial position of the bullet
        this.velocity = p5.Vector.fromAngle(angle).mult(Bullet.MAX_SPEED);
        this.damage = damage;
        this.isOffScreenDist = 1000;

        // Store previous positions for the trail
        this.trail = [];
        this.maxTrailLength = 10; // Maximum number of trail points
    }

    update() {
        // Update bullet position
        this.position.add(this.velocity);

        // Add current position to trail
        this.trail.push({
            position: this.position.copy(),
            heading: this.velocity.heading()
        });

        // Limit the trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift(); // Remove the oldest trail point
        }
    }

    show() {
        // Draw the trail with fading ellipses
        push();
        noStroke();
        for (let i = 0; i < this.trail.length; i++) {
            let alpha = map(i, 0, this.trail.length - 1, 0, 255); // Fading effect
            let size = map(i, 0, this.trail.length - 1, 1, 4); // Size decreases as the trail ages
            let colorTrail = color(50, 255, 78, alpha); // Color with fading alpha
            fill(colorTrail);

            // Draw the ellipse at the correct position and rotated by the stored heading
            push();
            translate(this.trail[i].position.x, this.trail[i].position.y);
            rotate(this.trail[i].heading+PI/2);
            ellipse(0, 0, size, size*3); // Draw ellipse trail
            pop();
        }
        pop();

        // Draw the bullet itself
        push();
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + PI / 2);
        fill(50, 255, 78);
        noStroke();
        ellipse(0, 0, 4, 12); // Bullet size
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
