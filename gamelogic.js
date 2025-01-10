function levelUp() {
    currentExp -= expNeeded;
    expNeeded += Math.round(20 * level * 0.5);
    level++;
    gamePaused = true; // Pause the game
    gameState = 'levelUp'; 
    if (level % 10 === 0) {
        allowedNumofUpgrades++;
        //Enemy.levelUp();;
        enemyLevelUp();
    }

    if (random(1) < enemyLevelUpChance * (level-1) * 2) {
       enemyLevelUp();;
    }
    if (spawnInterval >= 60) {
        spawnInterval -= 2;
    }
}
function enemyLevelUp() {
    Enemy.MAX_HEALTH += Math.round((20 + Enemy.MAX_HEALTH * 0.1) / 10) * 10;
    addEffect(
        player.position.x,
        player.position.y,
        "⚠️",    // Emoji
        "ENEMIES LEVELED UP!", // Text
        60,      // Size
        [255, 255, 0], // Color
        60 * 5     // Lifespan in frames
    );
    Enemy.level=Enemy.level+1;
}

function keyPressed() {
    if ((key === 'P' || key === 'p' || keyCode === ESCAPE) && (gameState === 'playing')) {
        gameState = 'paused';
    } else if ((key === 'P' || key === 'p' || keyCode === ESCAPE) && (gameState === 'paused')) {
        gameState = 'playing';
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
    if (enemies.length > 30){
        return
    }
    let angle = random(TWO_PI);

    // Random distance to spawn outside the screen area, but around the player
    let radius = random(width / 2, width / 2 + 100);  // Distance from the player to spawn

    // Calculate spawn position relative to player position
    let x = cos(angle) * radius + player.position.x;
    let y = sin(angle) * radius + player.position.y;
    // Create and add the enemy at the calculated position
    if (random(1) < enemyLevelUpChance) {
       enemyLevelUp();
    }
    enemies.push(new Enemy(x, y));
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].hits(enemies[j])) {
                if (random(1) < player.stats.critChance) {
                    enemies[j].takeDamage(bullets[i].damage * player.stats.critDamage);
                    playSound(critSound);
                    // critSound.setVolume(0.1);
                    // critSound.play();
                    addEffect(
                        bullets[i].position.x,
                        bullets[i].position.y,
                        "💥",    // Emoji
                        "CRIT!", // Text
                        60,      // Size
                        [255, 0, 0], // Color
                        60       // Lifespan in frames
                    );
                    bullets.splice(i, 1);
                    break;
                } else {
                    playSound(hitSound);
                    enemies[j].takeDamage(bullets[i].damage);
                    bullets.splice(i, 1);
                    break;
                }
            }
        }
    }
}
