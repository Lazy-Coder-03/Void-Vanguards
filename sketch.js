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
let spawnInterval = 120;
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

function preload() {
  backgroundSound = loadSound('sounds/Background.mp3');
  turboSound = loadSound('sounds/powerup.mp3');
  explosionSound = loadSound('sounds/ship_destroy.mp3');
  critSound = loadSound('sounds/crit.mp3');
  fireSound = loadSound('sounds/laser_sound.mp3');
  expSound = loadSound('sounds/exp_pickup.mp3');
  gameOverSound = loadSound('sounds/game_over.mp3');
  healSound = loadSound('sounds/heal.mp3');
  spaceShipIcon = loadImage('icons/spaceship_better.png');
  orbIcon = loadImage('icons/E7BE.gif')
  heartIcon= loadImage('icons/heart.gif')
  hitSound = loadSound('sounds/hit2.mp3');
  hurtSound = loadSound('sounds/hurt.mp3');
  buttonSound = loadSound('sounds/button.mp3');
  for (let i = 0; i < 10; i++) {  // Adjust the number to match how many sounds you have
    let soundFile = `sounds/laserSounds/laser_${i}.mp3`;  // Generate the file name dynamically
    laserSounds.push(loadSound(soundFile));
  }

}
function playSound(sound) {
  sound.setVolume(0.05);
  sound.rate(random(0.8, 1.2));
  if (soundOn && !sound.isPlaying()) {
    sound.play();
  }
}

function playLaserSounds() {
  let randomIndex = Math.floor(random(laserSounds.length));
  let randomPitch = random(0.9, 1.1);
  laserSounds[randomIndex].rate(randomPitch);
  laserSounds[randomIndex].setVolume(0.07);
  laserSounds[randomIndex].play();
}


function setup() {
  createCanvas(800, 600);
  player = new Drone(400, 300);  // Example player position
  Xship = new Plane(width/2, height/2)
  cameraPosition = createVector(0, 0);
  frameRate(60);
  toggleSoundButton = new graphicsButton(soundOn ? "Sound: ON" : "Sound: OFF", [255, 255, 0], width / 2, height / 2 + 200, 40);
  backgroundSound.setVolume(0.1);  // Adjust volume
  backgroundSound.loop();  // Loop the background sound
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
              expSound.setVolume(0.1);
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
                healSound.setVolume(0.1);
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
            hurtSound.setVolume(0.5);
            hurtSound.play();
            enemies.splice(i, 1);
            if (player.stats.health <= 0) {
              // Change game state to gameOver
              gameState = 'gameOver';
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
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(32);
        background(0, 150);
        text("Game Over", width / 2, height / 2 - 50);
        text(`Final Score: ${score}`, width / 2, height / 2);

        backgroundSound.stop();

        // Display the Try Again button
        tryAgainBtn.show();
        break;

      case 'levelUp':
        drawUpgradeMenu();
        break;
    }
  }

  // Handle Try Again button click when the game is over
  if (gameState === 'gameOver' && tryAgainBtn.isButtonClicked()) {
    backgroundSound.setVolume(0.1);
    backgroundSound.loop();
    resetGame();  // Reset the game when the button is clicked
  }
}
function getExpAmount() {
  return Math.round(20 + (level - 1) * 1.01);
}
// Function to show paused state and controls
function drawPausedState() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  background(0, 150);  // Semi-transparent background for the pause menu
  text("Game Paused", width / 2, height / 2 - 150);

  resumeButton = new graphicsButton("Resume", [0, 255, 0], width / 2 - 200, height / 2 + 150, 40);
  resumeButton.show();
  restartButton = new graphicsButton("Restart", [128, 50, 50], width / 2 + 200, height / 2 + 150, 40);
  restartButton.show();
  backToStartMenuButton = new graphicsButton("Back to Start Menu", [255, 255, 0], width / 2, height / 2 + 150, 40);
  backToStartMenuButton.show();

  // Update text for the toggle sound button
  toggleSoundButton.text = soundOn ? "Sound: ON" : "Sound: OFF";
  toggleSoundButton.x = width / 2
  toggleSoundButton.y= height / 2 + 200
  toggleSoundButton.show();

  // Handle button clicks
  if (resumeButton.isButtonClicked()) {
    gameState = 'playing';
    loop();  // Restart the game loop
  }

  if (restartButton.isButtonClicked()) {
    gameState = 'playing';
    resetGame();
  }

  if (backToStartMenuButton.isButtonClicked()) {
    gameState = 'startMenu';  // Set a specific state for the start menu
    resetGame();
    gameStarted = false;
  }

  // Toggle sound on/off when the toggle button is clicked
  if (toggleSoundButton.isButtonClicked()) {
    soundOn = !soundOn;
    if (soundOn) {
      backgroundSound.setVolume(0.1);  // Restore sound volume
      backgroundSound.loop();
    } else {
      backgroundSound.setVolume(0);  // Mute the background sound
      backgroundSound.stop();
    }
  }

  // Display controls
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Controls:", width / 2, height / 2 - 120);
  text("W / Arrow Up - Move Up", width / 2, height / 2 - 90);
  text("S / Arrow Down - Move Down", width / 2, height / 2 - 60);
  text("A / Arrow Left - Move Left", width / 2, height / 2 - 30);
  text("D / Arrow Right - Move Right", width / 2, height / 2);
  text("Space - Activate Turbo", width / 2, height / 2 + 30);
  text("P / ESC - Pause/Unpause", width / 2, height / 2 + 60);
  text("Click 'Resume' button to resume", width / 2, height / 2 + 90);
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
  allowedNumofUpgrades = 3;
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