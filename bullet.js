class Bullet {
    constructor(x, y, angle, damage) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.fromAngle(angle).mult(10);
        this.damage = damage;
    }

    update() {
        this.position.add(this.velocity);
    }

    show() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + PI / 2);
        fill(255, 255, 0);
        noStroke();
        //ellipse(0, 0, 5, 5);
        textSize(10);
        fill(255);
        textAlign(CENTER, CENTER);
        text("🛆", 0, 0);
        text(`${this.damage}`, 0, 20);
        pop();
    }

    isOffScreen() {
        return (
            this.position.x < 0 || this.position.x > width ||
            this.position.y < 0 || this.position.y > height
        );
    }

    hits(enemy) {
        return dist(this.position.x, this.position.y, enemy.position.x, enemy.position.y) < 10;
    }
}
