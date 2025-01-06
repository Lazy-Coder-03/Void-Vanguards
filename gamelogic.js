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
    if (enemies.length > 10){
        return
    }
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
                if (random(1) < critChance) {
                    enemies[j].takeDamage(bullets[i].damage * critDamage);

                    // Add crit effect to the array
                    critEffects.push({
                        x: bullets[i].position.x,
                        y: bullets[i].position.y,
                        text: "CRIT!",
                        emoji: "💥",
                        size: 60,
                        lifespan: 60 // Frames to linger
                    });

                    bullets.splice(i, 1);  // Destroy the bullet
                    break;  // Exit the inner loop as the bullet is destroyed
                } else {
                    enemies[j].takeDamage(bullets[i].damage);
                    bullets.splice(i, 1);  // Destroy the bullet
                    break;  // Exit the inner loop as the bullet is destroyed
                }
            }
        }
    }
}
