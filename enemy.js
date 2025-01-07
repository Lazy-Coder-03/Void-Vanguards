class Enemy {
    static MAX_HEALTH = 50;
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 1;
        this.maxForce = 0.1;
        this.maxHealth = Enemy.MAX_HEALTH;
        this.health = Enemy.MAX_HEALTH;
        this.displayedHealth = this.health; // Smooth transition for visual size
        this.healthBarWidth = 50; // Width of health bar
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0; // Prevent health from going below 0
    }

    dropExp(amt) {
        return new Exp(this.position.x, this.position.y, amt);
    }

    dropHealth(amount) {
        return new Health(this.position.x + random(-20, 20), this.position.y + random(-20, 20), amount);
    }

    applyForce(force) {
        this.acceleration.add(force.limit(this.maxForce));
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.position).setMag(this.maxSpeed);
        this.applyForce(p5.Vector.sub(desired, this.velocity).limit(this.maxForce));
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0);

        // Smoothly transition displayedHealth towards actual health
        this.displayedHealth += (this.health - this.displayedHealth) * 0.1;
    }

    show() {
        push();
        translate(this.position.x, this.position.y);

        // Smooth size adjustment based on displayedHealth
        let size = map(this.displayedHealth, 0, this.maxHealth, 20, 50);
        textSize(size);
        fill(255);
        textAlign(CENTER, CENTER);
        text("🛸", 0, 0);
        pop();

        // Draw health bar
        push();
        fill(255);
        rect(this.position.x - this.healthBarWidth / 2, this.position.y - 30, this.healthBarWidth, 5);
        fill(0, 255, 0);
        rect(
            this.position.x - this.healthBarWidth / 2,
            this.position.y - 30,
            map(this.health, 0, this.maxHealth, 0, this.healthBarWidth),
            5
        );
        textSize(10);
        fill(255);
        textAlign(CENTER, CENTER);
        text(`${Math.round(this.health)}/${this.maxHealth}`, this.position.x, this.position.y - 35);
        pop();
    }
}
