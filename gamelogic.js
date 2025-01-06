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
    let r = random(1);
    let x, y;
    if (r < 0.25) {
        x = random(width, width + 50);
        y = random(height);
    } else if (r >= 0.25 && r < 0.5) {
        x = random(-50, 0);
        y = random(height);
    } else if (r >= 0.5 && r < 0.75) {
        x = random(width);
        y = random(height, height + 50);
    } else {
        x = random(width);
        y = random(-50, 0);
    }
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