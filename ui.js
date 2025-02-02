function drawUI() {
    // Apply custom font
    textFont('Russo One');
    let size = width*0.02
    // Reset transformations to screen coordinates
    const statNames = [
        { label: "Level", value: level+"" },
        { label: "EXP", value: `${currentExp}/${expNeeded}` },
        { label: "HP", value: `${player.stats.health}/${Drone.MAX_HEALTH}` },
        { label: "Damage", value: player.stats.damage },
        { label: "Fire Rate", value: player.stats.bps },
        { label: "DPS", value: (player.stats.damage * player.stats.bps).toFixed(2) },
        { label: "Movement Speed", value: player.stats.speed },
        { label: "Crit Chance", value: (player.stats.critChance * 100).toFixed(2) + "%" },
        { label: "Crit Damage", value: (player.stats.critDamage * 100).toFixed(2) + "%" },
        { label: "Collection Radius", value: player.stats.collectionRadius },
        // { label: "Turbo Charge Rate", value: player.turboChargeRate.toFixed(2) },
        { label: "Turbo Charge Time", value: (player.baseStats.turboChargeMaxTime / 1000).toFixed(2) + "s" },
        { label: "Turbo Duration", value: (player.baseStats.turboDuration / 1000).toFixed(2) + "s" }
    ];

    resetMatrix();
    push();
    strokeWeight(5);
    stroke(220);
    fill(51, 100);
    rect(0, 0, 350, (statNames.length * (size + 1)) + size, 20);
    pop();
    let barWidth = width / 2.5;
    let barHeight = 20;

    textSize(size);
    // Draw EXP bar
    fill(255);
    rect(width / 2 - barWidth/2, 10, barWidth, barHeight, 10);
    fill(54, 200, 78);
    rect(width / 2 - barWidth / 2, 10, map(currentExp, 0, expNeeded, 0, barWidth), barHeight, 10);
    textAlign(CENTER, CENTER);
    fill(255);
    text(`Level ${level}`, width / 2, 50);
    text(`EXP: ${currentExp}/${expNeeded}`, width / 2, 80);

    // Draw health bar
    // fill(255);
    // rect(10, 30, 200, 10);
    // fill(255, 0, 0);
    // rect(10, 30, map(player.stats.health, 0, Drone.MAX_HEALTH, 0, 200), 10);

    // Draw stats
    fill(255);
    textSize(24);
    textAlign(LEFT);
    fill(0,255,50)
    text("Stats :", 10, 20);
    colorMode(HSB);
    let yPosition = size+20;
    for (let i=0; i<statNames.length; i++) {
        // Format numbers to 3 decimal places if necessary
        let value = typeof statNames[i].value === "number" ? statNames[i].value.toFixed(2) : statNames[i].value;
        let h = map(i, 0, statNames.length, 0, 360);
        fill(h, 100, 100);
        stroke((h+180)%360, 100, 100);
        text(`${statNames[i].label}: ${value}`, 10, yPosition);
        yPosition += size; // Move down for the next stat
    }
    colorMode(RGB);

    // Draw score on the top right of the screen
    fill(255);
    stroke(0);
    textSize(size);
    textAlign(RIGHT);
    text(`Score: ${score}`, width - 10, 20);
}
function getExponentialRandom(min, max) {
    // Ensure lower values are more common
    const randomFactor = Math.random(); // Random number between 0 and 1

    // Use a power curve to adjust the distribution (lower values more likely)
    const weightedRandom = Math.pow(randomFactor, 3); // Adjust the exponent for desired skew

    // Scale to the desired range
    const range = max - min;
    const result = min + weightedRandom * range;

    // Return the rounded value to the nearest hundredth
    return Math.round(result * 100) / 100;
}

function drawUpgradeMenu() {
    background(0, 150);
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("Choose Your Upgrade", width / 2, height / 2 - 40);
    // Define available upgrade options
    const options = [
        {
            text: "+Damage",
            color: [255, 182, 193],
            action: () => {
                let oldValue = player.stats.damage;
                let randomValue = getExponentialRandom(10, 30); // Weighted random value between 1 and 15
                if (player.isTurboActive) {
                    randomValue *= 2;  // Double the upgrade amount during turbo
                }
                player.addBaseStat("damage", randomValue);
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Damage: ${oldValue} -> ${player.stats.damage}`);
                if (player.isTurboActive) {
                    addEffect(player.position.x, player.position.y, "⚡", `+Damage: ${player.stats.damage / 2}`, 60, [255, 182, 193]);
                } else {
                    addEffect(player.position.x, player.position.y, "⚡", `+Damage: ${player.stats.damage}`, 60, [255, 182, 193]);
                }
            }
        },
        {
            text: "+Fire Rate",
            color: [173, 216, 230],
            action: () => {
                let oldValue = player.stats.bps;
                let randomValue = getExponentialRandom(0.2, 2); // Weighted random value between 0.1 and 3
                if (player.isTurboActive) {
                    randomValue *= 2;  // Double the upgrade amount during turbo
                }
                player.addBaseStat("bps", randomValue);
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Fire Rate: ${oldValue} -> ${player.stats.bps}`);
                if (player.isTurboActive) {
                    addEffect(player.position.x, player.position.y, "🔥", `+Fire Rate: ${player.stats.bps / 2}`, 60, [173, 216, 230])
                } else {
                    addEffect(player.position.x, player.position.y, "🔥", `+Fire Rate: ${player.stats.bps}`, 60, [173, 216, 230], 240);
                }
            }
        },
        {
            text: "+Crit Damage",
            color: [255, 239, 128],
            action: () => {
                let oldValue = player.stats.critDamage;
                let randomValue = getExponentialRandom(0.5, 1); // Weighted random value between 1 and 10
                if (player.isTurboActive) {
                    randomValue *= 2;  // Double the upgrade amount during turbo
                }
                player.addBaseStat("critDamage", randomValue);
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Crit Damage: ${oldValue} -> ${player.stats.critDamage}`);
                if (player.isTurboActive) {
                    addEffect(player.position.x, player.position.y, "💥", `+Crit Damage: ${player.stats.critDamage / 2}`, 60, [255, 239, 128]);
                } else {
                    addEffect(player.position.x, player.position.y, "💥", `+Crit Damage: ${player.stats.critDamage}`, 60, [255, 239, 128], 240);
                }
            }
        },
        {
            text: "+Crit Chance",
            color: [144, 238, 144],
            action: () => {
                let oldValue = player.stats.critChance;
                let randomValue = getExponentialRandom(0.05, 0.12); // Weighted random value between 0.01 and 0.2
                player.addBaseStat("critChance", randomValue);
                if (player.stats.critChance > 1) player.stats.critChance = 1; // Ensure crit chance doesn't exceed 100%
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Crit Chance: ${oldValue} -> ${player.stats.critChance}`);
                if (player.isTurboActive) {
                    addEffect(player.position.x, player.position.y, "🎯", `+Crit Chance: ${player.stats.critChance / 2}`, 60, [144, 238, 144]);
                } else {
                    addEffect(player.position.x, player.position.y, "🎯", `+Crit Chance: ${player.stats.critChance}`, 60, [144, 238, 144], 240);
                }
            }
        },
        {
            text: "+Speed",
            color: [255, 204, 153],
            action: () => {
                let oldValue = player.stats.speed;
                let randomValue = getExponentialRandom(0.1, 2); // Weighted random value between 0.1 and 2
                if (player.isTurboActive) {
                    randomValue *= 2;  // Double the upgrade amount during turbo
                }
                player.addBaseStat("speed", randomValue);
                
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Speed: ${oldValue} -> ${player.stats.speed}`);
                if (player.isTurboActive) {
                    addEffect(player.position.x, player.position.y, "🏎️", `+Speed: ${player.stats.speed / 2}`, 60, [255, 204, 153]);
                } else {
                    addEffect(player.position.x, player.position.y, "🏎️", `+Speed: ${player.stats.speed}`, 60, [255, 204, 153], 240);
                }
            }
        },
        {
            text: "+HP",
            color: [204, 255, 255],
            action: () => {
                let oldValue = player.stats.health;
                const randomValue = 10; // Weighted random value between 5 and 30
                Drone.MAX_HEALTH += randomValue;
                player.addBaseStat("health", randomValue);
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Health: ${oldValue} -> ${player.stats.health}`);
                addEffect(player.position.x, player.position.y, "❤️", `+HP: ${player.stats.health}`, 60, [204, 255, 255], 240);
            }
        },
        {
            text: "+Collection Radius",
            color: [216, 191, 216],
            action: () => {
                let oldValue = player.stats.collectionRadius;
                const randomValue = getExponentialRandom(10, 50); // Weighted random value between 2 and 20
                player.addBaseStat("collectionRadius", Math.round(randomValue));
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Collection Radius: ${oldValue} -> ${player.stats.collectionRadius}`);
                addEffect(player.position.x, player.position.y, "📡", `+Collection Radius: ${player.stats.collectionRadius}`, 60, [216, 191, 216], 240);
            }
        },
        {
            text: "+Turbo Duration",
            color: [255, 182, 193],
            action: () => {
                let oldValue = player.baseStats.turboDuration;
                const scaleFactor = oldValue * 0.05; // Use a fraction of the current value for scaling
                const randomValue = getExponentialRandom(scaleFactor, scaleFactor * 2); // Use current value for scaling
                player.addBaseStat("turboDuration", randomValue);
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Upgraded Turbo Duration: ${oldValue} -> ${player.baseStats.turboDuration}`);
                addEffect(player.position.x, player.position.y, "🚀", `+Turbo Duration: ${player.baseStats.turboDuration}`, 60, [255, 182, 193], 240);
            }
        },
        {
            text: "-Turbo Charge Time",
            color: [204, 204, 255],
            action: () => {
                let oldValue = player.baseStats.turboChargeMaxTime;
                const scaleFactor = oldValue * 0.05; // Use a fraction of the current value for scaling
                const randomValue = getExponentialRandom(scaleFactor, scaleFactor * 2); // Scale the decrement based on current time
                player.addBaseStat("turboChargeMaxTime", -randomValue); // Decrease charge time
                console.log(`Upgrade Amount: ${randomValue}`);
                console.log(`Decreased Turbo Charge Time: ${oldValue} -> ${player.baseStats.turboChargeMaxTime}`);
                addEffect(player.position.x, player.position.y, "⏱️", `-Turbo Charge Time: ${player.baseStats.turboChargeMaxTime}`, 60, [204, 204, 255], 240);
            }
        }
    ];


    

    // Shuffle and select 2 random options
    const selectedUpgrades = shuffleArray(options).slice(0, allowedNumofUpgrades);
    // Create buttons if they don't exist
    if (upgrades.length === 0) {
        for (let i = 0; i < selectedUpgrades.length; i++) {
            upgrades.push(new graphicsButton(selectedUpgrades[i].text, selectedUpgrades[i].color, width / 2, height / 2 + i * 50, 50));
        }
        // upgrades = [
        //     new graphicsButton(selectedUpgrades[0].text, selectedUpgrades[0].color, width / 2 - 120, height / 2, 50),
        //     new graphicsButton(selectedUpgrades[1].text, selectedUpgrades[1].color, width / 2 + 120, height / 2, 50)
        // ];
    }

    // Display and handle button clicks
    for (let upgrade of upgrades) {
        upgrade.hover = upgrade.isHovered();
        upgrade.show();

        if (upgrade.isButtonClicked()) {
            upgradeOption = upgrade.text; // Set the upgrade option when the button is clicked

            console.log(`Upgrade chosen: ${upgradeOption}`);

        }
    }
    

    // Apply the selected upgrade
    if (upgradeOption) {
        const selectedUpgrade = selectedUpgrades.find(opt => opt.text === upgradeOption);
        if (selectedUpgrade) {
            selectedUpgrade.action();
            if (random(1) < bonusUpgradeChance) {
                selectedUpgrade.action(); // Apply bonus upgrade
                console.log("Bonus upgrade applied!");
                addEffect(
                    player.position.x,
                    player.position.y-100,
                    "🌟",    // Emoji
                    "2X BONUS UPGRADED", // Text
                    72,      // Size
                    [255, 255, 0], // Color
                    120     // Lifespan in frames
                );
            }

            console.log(`${upgradeOption} applied!`);
            gameState = 'playing'; // Transition back to playing state
            upgradeOption = null; // Reset upgrade option after applying
            upgrades = []; // Reset buttons after use
        }
    }
}
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
    toggleSoundButton.y = height / 2 + 200
    toggleSoundButton.h = 40
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
            backgroundSound.play();
        } else {
            backgroundSound.pause();
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
function drawGameOverScreen() {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    background(0, 150);
    text("Game Over", width / 2, height / 2 - 50);
    text(`Final Score: ${score}`, width / 2, height / 2);

    backgroundSound.stop();
    // Display the Try Again button
    tryAgainBtn.show();
}
// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class graphicsButton {
    constructor(text, color, x, y, h) {
        this.text = text;
        this.color = color;
        this.x = x;
        this.y = y;
        this.w = this.calculateWidth(text);
        this.h = h;
        this.triggered = false;
        this.hover = false;
        this.lastClickTime = 0;  // Track the time of the last click
        this.refractoryPeriod = 500; // 50 milliseconds refractory period
    }

    calculateWidth(text) {
        textSize(20);  // Set text size to match button text size
        let textWidthValue = textWidth(text);  // Get the width of the text
        return textWidthValue + 40;  // Add padding (e.g., 40 pixels total for both sides)
    }

    show() {
        push();
        rectMode(CENTER);

        // Highlight the button when hovered
        this.hover = this.isHovered();
        if (this.hover) {
            fill(200, 200, 200);  // Lighter color for hover effect
        } else {
            fill(this.color[0], this.color[1], this.color[2]);
        }
        stroke(0);
        strokeWeight(3);
        rect(this.x, this.y, this.w, this.h, 20);  // Draw the button with rounded corners
        strokeWeight(1);
        stroke(255);
        fill(0);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(this.text, this.x, this.y);  // Draw the text on the button
        pop();
    }

    isHovered() {
        return mouseX > this.x - this.w / 2 &&
            mouseX < this.x + this.w / 2 &&
            mouseY > this.y - this.h / 2 &&
            mouseY < this.y + this.h / 2;
    }

    isButtonClicked() {
        // Check if enough time has passed since the last click
        if (this.hover && mouseIsPressed && !this.triggered && millis() - this.lastClickTime > this.refractoryPeriod) {
            this.triggered = true;  // Mark the button as triggered
            this.lastClickTime = millis();  // Update the last click time
            console.log(`Button clicked: ${this.text}`);
            buttonSound.play();
            return true;
        }

        // Reset triggered flag when mouse is released
        if (!mouseIsPressed) {
            this.triggered = false;
        }

        return false;
    }
}





class Effect {
    constructor(x, y, emoji, text, size, color, lifespan) {
        this.x = x; // World coordinates
        this.y = y; // World coordinates
        this.emoji = emoji;
        this.text = text;
        this.size = size;
        this.color = color; // RGB array, e.g., [255, 255, 0]
        this.lifespan = lifespan; // Frames
        this.initialLifespan = lifespan; // Store initial lifespan for fading
    }

    update() {
        this.lifespan--;
    }

    isExpired() {
        return this.lifespan <= 0;
    }

    draw(playerX, playerY) {
        let screenX = this.x - playerX + width / 2;
        let screenY = this.y - playerY + height / 2;

        push();
        textAlign(CENTER, CENTER);
        let alpha = map(this.lifespan, 0, this.initialLifespan, 0, 255);

        // Draw emoji or effect icon
        textSize(this.size);
        fill(this.color[0], this.color[1], this.color[2], alpha);
        text(this.emoji, screenX, screenY);

        // Draw associated text (optional)
        if (this.text) {
            textSize(this.size / 3);
            fill(255, alpha);
            text(this.text, screenX, screenY - 50);
        }
        pop();
    }
}

function drawStartMenu() {
    textFont('Russo One')
    background(0, 150);
    Xship.seek(mouseX, mouseY);
    Xship.update();
    Xship.show();
    fill(255);
    textSize(64);
    textAlign(CENTER);
    let title = "Void Vanguards 🚀";
    text(title, width / 2, height / 2 - height*0.35);
    // Create buttons
    let startBtn = new graphicsButton("Play", [0, 255, 0], width / 2, (height / 2) - height * 0.2,75);
    let rulesBtn = new graphicsButton("Rules", [255, 255, 0], width / 2, (height / 2)-height * 0.05, 75);
    let codeBtn = new graphicsButton("Code", [255, 0, 255], width / 2, (height / 2) + height * 0.1 , 75);
    toggleSoundButton.x = width / 2
    toggleSoundButton.y = (height / 2) + height * 0.25
    toggleSoundButton.h = 75
    toggleSoundButton.show();
    // Show buttons
    startBtn.show();
    rulesBtn.show();
    codeBtn.show();
    push();
    stroke(255)
    fill(255, 0, 0, 70);
    ellipse(mouseX, mouseY, 30, 30)
    pop();

    if (toggleSoundButton.isButtonClicked()) {
        soundOn = !soundOn;
        if (soundOn) {
            //backgroundSound.setVolume(0.1);  // Restore sound volume
            backgroundSound.play();
        } else {
            //backgroundSound.setVolume(0);  // Mute the background sound
            backgroundSound.stop();
        }
    }
    toggleSoundButton.text = soundOn ? "Sound: ON" : "Sound: OFF"
    // Button click events
    if (startBtn.isButtonClicked()) {
        gameStarted = true;
        gamePaused = false; // Start the game
        gameState = 'playing';
    }
    if (rulesBtn.isButtonClicked()) {
        // Show rules (You can modify this to show the actual rules)
        window.location.href = "rules.html";
    }
    if (codeBtn.isButtonClicked()) {
        // Show code link (modify to your repository or any code source)
        window.open("https://github.com/Lazy-Coder-03/Void-Vanguards", "_blank");
    }
}

class Plane{
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 2;
        this.maxForce = 0.1;
    }

    applyForce(force) {
        this.acceleration.add(force.limit(this.maxForce));
    }

    seek(targetx, targety) {
        let target = createVector(targetx, targety); // Convert target coordinates to a p5.Vector
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

        // Calculate the angle of the velocity vector
        let angle = this.velocity.heading();  // heading() gives the angle of the vector

        // Rotate the plane based on the angle of the velocity
        rotate(angle+PI/2);

        // Draw the icon of the drone (ship) saved in spaceShipIcon PNG
        image(spaceShipIcon, -20, -20, 40, 40);

        // Draw the turbo charge arc if turbo is active
        stroke(127, 78, 56);
        strokeWeight(2);
        noFill();

        pop();

        // Draw the Turbo Charge bar
    }

}