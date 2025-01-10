let player;
let enemies = [];
let bullets = [];
let exps = [];
let healths = [];
let level = 1;
let gameStarted = false;
let expNeeded = 50;
let currentExp = 0;
let gamePaused = true;
let upgrades = [];
let upgradeOption = null;
let bonusUpgradeChance = 0.05;
let spawnInterval = 90;
let healthDropChance = 0.1;
let cameraPosition;  // Camera position
let dampeningFactor = 0.1;  // Adjust for more or less lag
let effects = [];
let score = 0;
let enemyLevelUpChance = 0.01;
let tryAgainBtn;
let gameState = 'playing'
let backgroundSound;
let pauseButton;
let restartButton;
let backToStartMenuButton;
let laserSounds = [];
let Xship
let soundOn = true;
let toggleSoundButton;
let allowedNumofUpgrades = 2;

let xpOrbLifeSpan = 2700;
let healthOrbLifeSpan = 2700;


function preload() {
  spaceShipIcon = loadImage('icons/spaceship_better.png');
  orbIcon = loadImage('icons/E7BE.gif')
  heartIcon = loadImage('icons/heart.gif')
}

function preloadSounds() {
  backgroundSound=new Howl({
    src:['sounds/Background.mp3'],
    volume:0.3,
    loop:true
  });
  turboSound=new Howl({
    src:['sounds/powerup.mp3'],
    volume:0.3
  });
  explosionSound=new Howl({
    src:['sounds/ship_destroy.mp3'],
    volume:0.3
  });
  critSound=new Howl({
    src:['sounds/crit.mp3'],
    volume:0.3
  });
  fireSound=new Howl({
    src:['sounds/laser_sound.mp3'],
    volume:0.3
  });
  expSound=new Howl({
    src:['sounds/exp_pickup.mp3'],
    volume:0.3
  });
  gameOverSound=new Howl({
    src:['sounds/game_over.mp3'],
    volume:0.3
  });
  healSound=new Howl({
    src:['sounds/heal.mp3'],
    volume:0.3
  });
  hitSound=new Howl({
    src:['sounds/hit2.mp3'],
    volume:0.3
  });
  hurtSound=new Howl({
    src:['sounds/hurt.mp3'],
    volume:0.3
  });
  buttonSound=new Howl({
    src:['sounds/button.mp3'],
    volume:0.3
  });
  for (let i = 0; i < 10; i++) {
    let soundFile = `sounds/laserSounds/laser_${i}.mp3`;
    laserSounds.push(new Howl({
      src: [soundFile],
      volume: 0.2
    }));
  }

}

function playSound(sound) {
  if (soundOn) {
    // Set random playback rate
    sound.rate(random(0.8, 1.2));

    // Set volume
    sound.volume(0.1);

    // Play the sound
    sound.play();
  }
}


function playLaserSounds() {
  if (soundOn) {
    let randomIndex = Math.floor(Math.random() * laserSounds.length);
    let laserSound = laserSounds[randomIndex];
    //laserSound.rate(random(0.9, 1.1));
    laserSound.play();
  }
}


function setup() {
  createCanvas(windowWidth*0.9, windowHeight*0.9);
  preloadSounds();
  player = new Drone(width / 2, height / 2);  // Example player position
  Xship = new Plane(width/2, height/2)
  cameraPosition = createVector(0, 0);
  frameRate(60);
  toggleSoundButton = new graphicsButton(soundOn ? "Sound: ON" : "Sound: OFF", [255, 255, 0], width / 2, height / 2 + 200, 40);
  backgroundSound.play();  // Loop the background sound
}

function windowResized() {
  resizeCanvas(windowWidth * 0.9, windowHeight * 0.9);
}

function draw() {
  background(0);


  if (!gameStarted) {
    drawStartMenu();
  } else {
    switch (gameState) {
      case 'startMenu':
        drawStartMenu();

        break;
      case 'playing':
        // Main game logic (everything happens here while playing)
        background(0);

        // Smoothly move the camera towards the player's position
        let targetPosition = player.position.copy();
        cameraPosition.lerp(targetPosition, dampeningFactor);  // Interpolate between current and target position

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
        if (frameCount % 60 === 0) {
          score++;
        }

        // Update and display enemies
        let expAmt = getExpAmount();

        for (let i = enemies.length - 1; i >= 0; i--) {
          enemies[i].seek(player.position);
          enemies[i].update();
          enemies[i].show();

          if (enemies[i].health <= 0) {
            let exp = enemies[i].dropExp(expAmt);
            playSound(explosionSound);
            if (random(1) < healthDropChance) {
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
          } else if (dist(player.position.x, player.position.y, exps[i].position.x, exps[i].position.y) < player.stats.collectionRadius) {
            exps[i].seek(player.position);
            if (dist(player.position.x, player.position.y, exps[i].position.x, exps[i].position.y) < player.getexpRadius) {
              currentExp += exps[i].value;
              score += exps[i].value;
              exps.splice(i, 1);
              expSound.play();
            }
          }
        }

        // Update and display Health orbs
        for (let i = healths.length - 1; i >= 0; i--) {
          healths[i].update();
          healths[i].show();

          if (healths[i].lifespan <= 0) {
            healths.splice(i, 1);
          } else if (player.stats.health < Drone.MAX_HEALTH && dist(player.position.x, player.position.y, healths[i].position.x, healths[i].position.y) < player.stats.collectionRadius) {
            healths[i].seek(player.position);
            if (dist(player.position.x, player.position.y, healths[i].position.x, healths[i].position.y) < player.getexpRadius) {
              if (player.stats.health < Drone.MAX_HEALTH) {
                player.stats.health += healths[i].value;
                healSound.play();
                healths.splice(i, 1);
              }
            }
          }
        }

        // Check for level up
        if (currentExp >= expNeeded) {
          levelUp();
        }

        // Update and display bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          bullets[i].update();
          bullets[i].show();
          if (bullets[i].isOffScreen()) {
            bullets.splice(i, 1);
          }
        }

        // Check for collisions with enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          if (dist(player.position.x, player.position.y, enemies[i].position.x, enemies[i].position.y) < 15) {
            player.stats.health -= 10;
            addEffect(player.position.x, player.position.y, "💥", "-10", 80, [255, 0, 0]);
            hurtSound.play();
            enemies.splice(i, 1);
            if (player.stats.health <= 0) {
              // Change game state to gameOver
              gameState = 'gameOver';
              gameOverSound.play();
              tryAgainBtn = new graphicsButton("Try Again", [0, 255, 0], width / 2, height / 2 + 100, 50);

            }
          }
        }

        drawUI();
        pauseButton = new graphicsButton("Pause", [255, 0, 0], width-60, 50, 30);
        // Update game state
        checkCollisions();
        updateEffects();
        drawEffects(player.position.x, player.position.y);

        // Pause button on top left corner
        pauseButton.show();
        if (pauseButton.isButtonClicked()) {
          gameState = 'paused';
          //noLoop();  // Stop the game loop
        }
        break;

      case 'paused':
        // Show the pause state with controls instructions
        drawPausedState();
        break;

      case 'gameOver':
        // Show Game Over screen and Try Again button
        drawGameOverScreen();
        break;

      case 'levelUp':
        drawUpgradeMenu();
        break;
    }
  }

  // Handle Try Again button click when the game is over
  if (gameState === 'gameOver' && tryAgainBtn.isButtonClicked()) {
    //backgroundSound.volume(0.1);
    if(soundOn){
      backgroundSound.play();
    }
    resetGame();  // Reset the game when the button is clicked
  }
}
function getExpAmount() {
  return Math.round(20 + (level - 1) * 1.01);
}
// Function to show paused state and controls




// Function to reset the game
function resetGame() {
  // Reset all game variables to start a new game
  player = new Drone(400, 300);
  enemies = [];
  bullets = [];
  exps = [];
  healths = [];
  level = 1;
  gameStarted = true;
  expNeeded = 50;
  currentExp = 0;
  gameState = 'playing';  // Set game state back to playing
  score = 0;
  Drone.MAX_HEALTH = 40;
  spawnInterval = 120;
  Enemy.MAX_HEALTH = 50;
  allowedNumofUpgrades = 3;
  backgroundSound.seek(0)
  loop();  // Restart the game loop
}
function addEffect(x, y, emoji, text = "", size = 40, color = [255, 255, 0], lifespan = 60) {
  effects.push(new Effect(x, y, emoji, text, size, color, lifespan));
}

function updateEffects() {
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].update();
    if (effects[i].isExpired()) {
      effects.splice(i, 1);
    }
  }
}

function drawEffects(playerX, playerY) {
  for (let effect of effects) {
    effect.draw(playerX, playerY);
  }
}

// Function to reset the game
function resetGame() {
  // Reset all game variables to start a new game
  player = new Drone(400, 300);
  enemies = [];
  bullets = [];
  exps = [];
  healths = [];
  level = 1;
  gameStarted = true;
  expNeeded = 50;
  currentExp = 0;
  gameState = 'playing';  // Set game state back to playing
  score = 0;
  Drone.MAX_HEALTH = 40;
  spawnInterval = 120;
  Enemy.MAX_HEALTH = 50;
  loop();  // Restart the game loop
}
function addEffect(x, y, emoji, text = "", size = 40, color = [255, 255, 0], lifespan = 60) {
  effects.push(new Effect(x, y, emoji, text, size, color, lifespan));
}

function updateEffects() {
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].update();
    if (effects[i].isExpired()) {
      effects.splice(i, 1);
    }
  }
}

function drawEffects(playerX, playerY) {
  for (let effect of effects) {
    effect.draw(playerX, playerY);
  }
}
function inScreenBounds(x, y) {
  return x > 0 && x < width && y > 0 && y < height;
}