let player;
let enemies = [];
let bullets = [];
let exps = [];
let healths = [];
let level = 1;
let expNeeded = 50;
let currentExp = 0;
let gamePaused = false;
let upgrades = [];
let upgradeOption = null;
let spawnInterval = 120;

let cameraPosition;  // Camera position
let dampeningFactor = 0.1;  // Adjust for more or less lag

function setup() {
    createCanvas(800, 600);
    player = new Drone(400, 300);  // Example player position
    cameraPosition = createVector(0,0);
    frameRate(60);
}

function draw() {
    if (!gamePaused) {
        background(0);

        // Smoothly move the camera towards the player's position
        let targetPosition = player.position.copy();
        cameraPosition.lerp(targetPosition, dampeningFactor);  // Interpolate between current and target position

        // Apply camera offset by adjusting the canvas draw position
        translate(width / 2 - cameraPosition.x, height / 2 - cameraPosition.y);

        // Update and display the player
        player.update();
        player.faceClosestEnemy(enemies);
        player.show();

        // Spawn enemies periodically
        if (frameCount % spawnInterval === 0) {
            spawnEnemies();
        }

        // Update and display bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].update();
            bullets[i].show();
            if (bullets[i].isOffScreen()) {
                bullets.splice(i, 1);
            }
        }

        // Update and display enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].seek(player.position);
            enemies[i].update();
            enemies[i].show();
            if (enemies[i].health <= 0) {
                let exp = enemies[i].dropExp(25);
                if (random(1) < 1) {
                    let health = enemies[i].dropHealth(10);
                    healths.push(health);
                }
                exps.push(exp);
                enemies.splice(i, 1);
            }
        }

        // Update and display EXP orbs
        for (let i = exps.length - 1; i >= 0; i--) {
            exps[i].update();
            exps[i].show();
            if (exps[i].lifespan <= 0) {
                exps.splice(i, 1);
            } else if (dist(player.position.x, player.position.y, exps[i].position.x, exps[i].position.y) < player.collectionRadius) {
                exps[i].seek(player.position);
                if (dist(player.position.x, player.position.y, exps[i].position.x, exps[i].position.y) < player.getexpRadius) {
                    currentExp += exps[i].value;
                    exps.splice(i, 1);
                }
            }
        }

        // Update and display Health orbs
        for (let i = healths.length - 1; i >= 0; i--) {
            healths[i].update();
            healths[i].show();

            if (healths[i].lifespan <= 0) {
                healths.splice(i, 1);
            } else if (player.health < Drone.MAX_HEALTH && dist(player.position.x, player.position.y, healths[i].position.x, healths[i].position.y) < player.collectionRadius) {
                healths[i].seek(player.position);
                if (dist(player.position.x, player.position.y, healths[i].position.x, healths[i].position.y) < player.getexpRadius) {
                    if (player.health < Drone.MAX_HEALTH) {
                        player.health += healths[i].value;
                        healths.splice(i, 1);
                    }
                }
            }
        }

        // Check for level up
        if (currentExp >= expNeeded) {
            levelUp();
        }

        // Check for collisions with enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (dist(player.position.x, player.position.y, enemies[i].position.x, enemies[i].position.y) < 15) {
                player.health -= 10;
                enemies.splice(i, 1);
                if (player.health <= 0) {
                    textSize(32);
                    fill(255);
                    textAlign(CENTER, CENTER);
                    text("Game Over", width / 2, height / 2);
                    noLoop();
                    console.log("Game Over");
                }
            }
        }

        // Draw EXP bar
        drawExpBar();

        // Draw health bar
        drawHealthBar();

        // Draw stats
        drawStats();

        // Update game state
        checkCollisions();
    } else {
        drawUpgradeMenu();
    }
}



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
        translate(this.position.x - player.position.x + width / 2, this.position.y - player.position.y + height / 2);
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
        // Adjusted for camera offset (considering player position as the camera's center)
        let cameraOffsetX = player.position.x - width / 2;
        let cameraOffsetY = player.position.y - height / 2;

        return (
            this.position.x + cameraOffsetX < 0 || this.position.x + cameraOffsetX > width ||
            this.position.y + cameraOffsetY < 0 || this.position.y + cameraOffsetY > height
        );
    }

    hits(enemy) {
        return dist(this.position.x, this.position.y, enemy.position.x, enemy.position.y) < 10;
    }
}
function levelUp() {
    currentExp -= expNeeded;
    expNeeded += 20 * level;
    level++;
    gamePaused = true;
    Enemy.MAX_HEALTH += Math.round((20 + Enemy.MAX_HEALTH * 0.075) / 10) * 10;
    if (spawnInterval >= 60) {
        spawnInterval -= 2;
    }

}
function keyIsDownHandler() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        player.applyForce(-1, 0);
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        player.applyForce(1, 0);
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        player.applyForce(0, -1);
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        player.applyForce(0, 1);
    }
}


function spawnEnemies() {
    // Random angle to determine spawn direction
    let angle = random(TWO_PI);

    // Random distance to spawn outside the screen area, but around the player
    let radius = random(width / 2, width / 2 + 100);  // Distance from the player to spawn

    // Calculate spawn position relative to player position
    let x = cos(angle) * radius + player.position.x;
    let y = sin(angle) * radius + player.position.y;

    // Create and add the enemy at the calculated position
    enemies.push(new Enemy(x, y));
}


function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].hits(enemies[j])) {
                enemies[j].takeDamage(bullets[i].damage);
                bullets.splice(i, 1);  // Destroy the bullet
                break;  // Exit the inner loop as the bullet is destroyed
            }
        }
    }
}
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

function drawExpBar() {
    fill(255);
    rect(10, 10, 200, 10);
    fill(0, 255, 0);
    rect(10, 10, map(currentExp, 0, expNeeded, 0, 200), 10);
}

function drawHealthBar() {
    fill(255);
    rect(10, 30, 200, 10);
    fill(255, 0, 0);
    rect(10, 30, map(player.health, 0, Drone.MAX_HEALTH, 0, 200), 10);
}

function drawStats() {
    fill(255);
    textSize(12);
    textAlign(LEFT);
    text(`Level: ${level}`, 10, 60);
    text(`EXP: ${currentExp}/${expNeeded}`, 10, 80);
    text(`HP: ${player.health}/${Drone.MAX_HEALTH}`, 10, 100);
    text(`DMG: ${player.damage}`, 10, 120);
    text(`FR: ${player.bps}`, 10, 140);
}

function drawUpgradeMenu() {
    background(0, 150);
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("Choose Your Upgrade", width / 2, height / 2 - 40);

    upgrades.push(new graphicsButton("+DMG", [0, 255, 0], width / 2 - 120, height / 2, 100, 50));
    upgrades.push(new graphicsButton("+FR", [0, 0, 255], width / 2 + 20, height / 2, 100, 50));

    for (let upgrade of upgrades) {
        upgrade.hover = upgrade.isHovered();
        upgrade.show();
        if (upgrade.isButtonClicked()) {
            upgrade.triggered = true;
            upgradeOption = upgrade.text;
        }
    }

    // Only process the upgrade once, and pause the game until it's done
    if (gamePaused && upgradeOption) {
        if (upgradeOption === "+DMG") {
            fill(255);
            textSize(20);
            textAlign(CENTER);
            text("Damage Upgraded!", width / 2, height / 2 + 100);
            player.damage += Math.round((10 + 0.025 * player.damage) / 10) * 10;
            console.log(player.damage);
            gamePaused = false;
            upgradeOption = null;  // Reset upgrade option after applying
        } else if (upgradeOption === "+FR") {
            fill(255);
            textSize(20);
            textAlign(CENTER);
            text("Fire Rate Upgraded!", width / 2, height / 2 + 100);
            player.bps += parseFloat((player.bps * 0.1).toFixed(2));
            console.log(player.bps);
            gamePaused = false;
            upgradeOption = null;  // Reset upgrade option after applying
        }
    }

}



class graphicsButton {
    constructor(text, color, x, y, w, h) {
        this.text = text;
        this.color = color;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.triggered = false;
        this.hover = false;
    }

    show() {
        fill(this.color[0], this.color[1], this.color[2]);
        rect(this.x, this.y, this.w, this.h, 20);
        fill(0);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(this.text, this.x + this.w / 2, this.y + this.h / 2);
    }

    isHovered() {
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }

    isButtonClicked() {
        return this.hover && mouseIsPressed;
    }
}