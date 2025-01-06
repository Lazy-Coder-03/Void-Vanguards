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
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    dropExp(amt) {
        return new Exp(this.position.x, this.position.y, amt);
    }

    dropHealth(amount) {
        return new Health(this.position.x + 20, this.position.y, amount);
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
    }

    show() {
        push();
        translate(this.position.x, this.position.y);
        fill(255, 50, 78);
        noStroke();
        ellipse(0, 0, 20, 20);
        textSize(10);
        fill(255);
        textAlign(CENTER, CENTER);
        text("💥", 0, 0);
        pop();

        // Draw health bar
        push();
        fill(255);
        rect(this.position.x - 25, this.position.y - 20, 50, 5);
        fill(0, 255, 0);
        rect(this.position.x - 25, this.position.y - 20, map(this.health, 0, this.maxHealth, 0, 50), 5);
        textSize(10);
        fill(255);
        textAlign(CENTER, CENTER);
        text(`${this.health}/${this.maxHealth}`, this.position.x, this.position.y - 25);
        pop();
    }
}