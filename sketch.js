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

function setup() {
  createCanvas(800,600);
  player = new Drone(400, 300);  // Example player position
  frameRate(60)
}

function draw() {
  if (!gamePaused) {
    background(0);

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
      }else if (player.health < Drone.MAX_HEALTH && dist(player.position.x, player.position.y, healths[i].position.x, healths[i].position.y) < player.collectionRadius) {
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


