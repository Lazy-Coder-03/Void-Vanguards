class Drone {
    static DEFAULT_STATS = {
        health: 40,
        speed: 2,
        force: 0.1,
        bps: 2,
        rotationSpeed: 0.1,
        damage: 40,
        critChance: 0.05,
        critDamage: 2,
        collectionRadius: 100, // Radius for collecting EXP orbs
        turboChargeMaxTime: 10000, // Max time for filling the turbo charge bar
        turboDuration: 5000 // How long turbo lasts (as a stat)
    };
    static MAX_HEALTH = 40;

    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

        this.baseStats = { ...Drone.DEFAULT_STATS };
        this.stats = { ...Drone.DEFAULT_STATS };

        this.rotation = 0;
        this.targetRotation = 0;
        this.friction = 0.07;
        this.lastShotTime = 0;
        this.getexpRadius = 20;
        this.perceptionRadius = 400;
        this.minSpeedRequired = 0.3;
        // Turbo Charge
        this.turboChargeTime = 0; // Time drone has stayed still
        this.isTurboActive = false; // Flag for turbo mode
        this.turboEndTime = 0; // When turbo mode ends
    }

    update() {
        keyIsDownHandler();
        this.stats.health = constrain(this.stats.health, 0, Drone.MAX_HEALTH);

        if (this.velocity.mag() < this.minSpeedRequired && millis() - this.lastShotTime > 1000 / this.stats.bps) {
            this.shootBullet();
            this.lastShotTime = millis();
        }

        if (this.acceleration.mag() === 0) {
            this.velocity.mult(1 - this.friction);
        }

        // Handle idle tracking and cap turbo charge bar
        if (this.velocity.mag() < this.minSpeedRequired && !this.isTurboActive) {
            this.turboChargeTime += deltaTime;
            this.turboChargeTime = constrain(this.turboChargeTime, 0, this.baseStats.turboChargeMaxTime);
        } else {
            this.turboChargeTime -= deltaTime * 3; // Reset if the drone moves
            this.turboChargeTime = constrain(this.turboChargeTime, 0, this.baseStats.turboChargeMaxTime);
        }


        // Activate turbo mode when bar is full and space is pressed
        if (this.turboChargeTime >= this.baseStats.turboChargeMaxTime && keyIsDown(32) && !this.isTurboActive) {
            this.activateTurboCharge();
            this.turboChargeTime = 0; // Reset turbo charge bar
        }

        // Deactivate turbo mode after duration
        if (this.isTurboActive && millis() >= this.turboEndTime) {
            this.deactivateTurboCharge();
        }

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.stats.speed);
        this.position.add(this.velocity);

        this.acceleration.set(0, 0);

        // Gradually rotate towards the target rotation
        let deltaAngle = this.targetRotation - this.rotation;
        if (deltaAngle > PI) deltaAngle -= TWO_PI;
        if (deltaAngle < -PI) deltaAngle += TWO_PI;
        this.rotation += constrain(deltaAngle, -this.stats.rotationSpeed, this.stats.rotationSpeed);
    }
    isTurboReady() {
        return this.turboChargeTime >= this.baseStats.turboChargeMaxTime;
    }

    applyForce(x, y) {
        let force = createVector(x, y).limit(this.stats.force);
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
            if (d < this.perceptionRadius && d < closestDist) {
                closestDist = d;
                closest = enemy;
            }
        }
        return closest;
    }

    shootBullet() {
        playLaserSounds()
        bullets.push(new Bullet(this.position.x, this.position.y, this.rotation, this.stats.damage));
    }

    show() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation + PI / 2);

        // Draw the main drone
        fill(15, 148, 36);
        noStroke();
        beginShape();
        vertex(10, 10);
        vertex(-10, 10);
        vertex(0, -20);
        endShape(CLOSE);
        //draw the icon of the drone saved in spaceShipIcon png
        image(spaceShipIcon, -20, -20, 40, 40);

        // Draw turbo charge arc if turbo is active
        if (this.isTurboActive) {
            stroke(0, 255, 255);
            strokeWeight(6);
            noFill();
            // Calculate angle based on remaining turbo time
            let remainingTime = this.turboEndTime - millis(); // Time left for turbo
            let angle = map(remainingTime, 0, this.baseStats.turboDuration, 0, TWO_PI);
            arc(0, 0, 60, 60, -HALF_PI, -HALF_PI + angle);  // Draw the arc from the top (starting at -HALF_PI)
        }

        stroke(127, 78, 56)
        strokeWeight(2);
        noFill();
        ellipse(0, 0, this.stats.collectionRadius * 2, this.stats.collectionRadius * 2);

        pop();
        // Draw Turbo Charge bar
        this.drawTurboChargeBar();
        this.drawHearts();
    }


    drawHearts() {
        let totalHearts = Math.floor(Drone.MAX_HEALTH / 10);  // Divide max health into heart sections (assuming each heart represents 10 HP)
        let fullHearts = Math.floor(this.stats.health / 10);   // Number of full hearts based on current health
        push();
        translate(this.position.x, this.position.y);
        // Draw hearts
        for (let i = 0; i < totalHearts; i++) {
            let s = 40 / totalHearts
            textSize(s);
            //textAlign(CENTER, CENTER);

            if (i < fullHearts) {
                fill(255, 0, 0);  // Filled heart (red)
                text("❤️", (i - (totalHearts / 2) + 1) * (s + 2), -20);  // Center the hearts
            } else {
                fill(150);  // Empty heart (gray)
                text("🖤", (i - (totalHearts / 2) + 1) * (s + 2), -20);  // Center the empty hearts
            }
        }
        pop();
    }

    activateTurboCharge() {
        this.isTurboActive = true;
        turboSound.setVolume(0.3);
        // turboSound.rate(random(0.8, 1.2));
        turboSound.play();
        this.turboEndTime = millis() + this.baseStats.turboDuration; // Use turboDuration from stats
        addEffect(
            this.position.x,
            this.position.y - 80,
            "🚀",    // Emoji
            "TURBO ACTIVATED!", // Text
            60,      // Size
            [0, 255, 255], // Color
            120      // Lifespan in frames
        );
        // Apply turbo multipliers
        this.stats.speed *= 2;
        this.stats.force *= 2;
        this.stats.bps *= 2;
        this.stats.rotationSpeed *= 2;
        this.stats.damage *= 2;
        this.stats.critDamage *= 2;
    }

    deactivateTurboCharge() {
        this.isTurboActive = false;

        this.stats.speed /= 2;
        this.stats.force /= 2;
        this.stats.bps /= 2;
        this.stats.rotationSpeed /= 2;
        this.stats.damage /= 2;
        this.stats.critDamage /= 2;
    }

    drawTurboChargeBar() {
        push();
        translate(this.position.x - 25, this.position.y - 40);

        // Add a glow effect when charge is full
        if (this.turboChargeTime >= this.baseStats.turboChargeMaxTime) {
            drawingContext.shadowColor = color(0, 255, 255); // Cyan glow
            drawingContext.shadowBlur = 15;  // Adjust the intensity of the glow
        } else {
            drawingContext.shadowColor = color(0, 0, 0, 0);  // No glow if not full
            drawingContext.shadowBlur = 0;  // No glow
        }

        // Draw the bar background
        fill(50);
        rect(0, 0, 50, 5);

        // Draw the progress
        fill(0, 255, 255);
        let progress = map(this.turboChargeTime, 0, this.baseStats.turboChargeMaxTime, 0, 50);
        rect(0, 0, progress, 5);

        pop();
    }


    addBaseStat(stat, value) {
        if (this.baseStats.hasOwnProperty(stat)) {
            this.baseStats[stat] += value;
            this.stats[stat] += value; // Ensure current stats also increase
        } else {
            console.warn(`Stat '${stat}' does not exist.`);
        }
    }

    setBaseStat(stat, value) {
        if (this.baseStats.hasOwnProperty(stat)) {
            this.baseStats[stat] = value;
            this.stats[stat] = value; // Ensure current stats are updated
        } else {
            console.warn(`Stat '${stat}' does not exist.`);
        }
    }
}
