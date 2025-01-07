function drawUI() {
    // Apply custom font
    textFont('Russo One');

    // Reset transformations to screen coordinates
    const statNames = [
        { label: "Level", value: level },
        { label: "EXP", value: `${currentExp}/${expNeeded}` },
        { label: "HP", value: `${player.stats.health}/${Drone.MAX_HEALTH}` },
        { label: "Damage", value: player.stats.damage },
        { label: "Fire Rate", value: player.stats.bps },
        { label: "DPS", value: (player.stats.damage * player.stats.bps).toFixed(2) },
        { label: "Movement Speed", value: player.stats.speed },
        { label: "Crit Chance", value: (player.stats.critChance * 100).toFixed(2) + "%" },
        { label: "Crit Damage", value: (player.stats.critDamage * 100).toFixed(2) + "%" },
        { label: "Collection Radius", value: player.stats.collectionRadius },
        { label: "Turbo Charge Time", value: (player.baseStats.turboChargeMaxTime / 1000).toFixed(2) + "s" },
        { label: "Turbo Duration", value: (player.baseStats.turboDuration / 1000).toFixed(2) + "s" }
    ];
    resetMatrix();
    push();
    strokeWeight(5);
    stroke(220);
    fill(51, 100);
    rect(0, 0, 220, statNames.length * 20 + 60, 20);
    pop();

    // Draw EXP bar
    fill(255);
    rect(10, 10, 200, 10);
    fill(0, 255, 0);
    rect(10, 10, map(currentExp, 0, expNeeded, 0, 200), 10);

    // Draw health bar
    fill(255);
    rect(10, 30, 200, 10);
    fill(255, 0, 0);
    rect(10, 30, map(player.stats.health, 0, Drone.MAX_HEALTH, 0, 200), 10);

    // Draw stats
    fill(255);
    textSize(12);
    textAlign(LEFT);

    let yPosition = 60;
    for (let stat of statNames) {
        // Format numbers to 3 decimal places if necessary
        let value = typeof stat.value === "number" ? stat.value.toFixed(2) : stat.value;

        text(`${stat.label}: ${value}`, 10, yPosition);
        yPosition += 20; // Move down for the next stat
    }

    // Draw score on the top right of the screen
    fill(255);
    textSize(20);
    textAlign(RIGHT);
    text(`Score: ${score}`, width - 10, 20);
}

function drawUpgradeMenu() {
    background(0, 150);
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("Choose Your Upgrade", width / 2, height / 2 - 40);

    // Define available upgrade options
    const options = [
        { text: "+DMG", color: [255, 182, 193], action: () => player.stats.damage += Math.round((10 + 0.025 * player.stats.damage)) },
        { text: "+FR", color: [173, 216, 230], action: () => player.stats.bps += parseFloat((player.stats.bps * 0.1).toFixed(2)) },
        { text: "+Crit DMG", color: [255, 239, 128], action: () => player.stats.critDamage += 0.2 },
        { text: "+Crit Chance", color: [144, 238, 144], action: () => { player.stats.critChance += 0.05; if (player.stats.critChance > 1) player.stats.critChance = 1; } },
        { text: "+Speed", color: [255, 204, 153], action: () => player.stats.speed += 0.2 },
        { text: "+HP", color: [204, 255, 255], action: () => { Drone.MAX_HEALTH += 10; player.stats.health += 10; } },
        { text: "+Collection Radius", color: [216, 191, 216], action: () => player.stats.collectionRadius += 10 },
        { text: "+Turbo Duration", color: [255, 182, 193], action: () => player.baseStats.turboDuration += 500 },
        { text: "-Turbo Charge Time", color: [204, 204, 255], action: () => player.baseStats.turboChargeMaxTime -= 100 }
    ];

    // Shuffle and select 2 random options
    const selectedUpgrades = shuffleArray(options).slice(0, 2);

    // Create buttons if they don't exist
    if (upgrades.length === 0) {
        upgrades = [
            new graphicsButton(selectedUpgrades[0].text, selectedUpgrades[0].color, width / 2 - 120, height / 2, 50),
            new graphicsButton(selectedUpgrades[1].text, selectedUpgrades[1].color, width / 2 + 120, height / 2, 50)
        ];
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
            }

            console.log(`${upgradeOption} applied!`);
            gameState = 'playing'; // Transition back to playing state
            upgradeOption = null; // Reset upgrade option after applying
            upgrades = []; // Reset buttons after use
        }
    }
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
        // Ensure that the button is only triggered once per click
        if (this.hover && mouseIsPressed && !this.triggered) {
            this.triggered = true;  // Mark the button as triggered
            console.log(`Button clicked: ${this.text}`);
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
    fill(255);
    textSize(30);
    textAlign(CENTER);
    let title = "Void Hunters";
    text(title, width / 2, height / 2 - 200);

    // Create buttons
    let startBtn = new graphicsButton("Play", [0, 255, 0], width / 2, height / 2 - 100, 50);
    let rulesBtn = new graphicsButton("Rules", [255, 255, 0], width / 2, height / 2, 50);
    let codeBtn = new graphicsButton("Code", [255, 0, 255], width / 2, height / 2 + 100, 50);

    // Show buttons
    startBtn.show();
    rulesBtn.show();
    codeBtn.show();

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
        window.open("https://github.com/Lazy-Coder-03/Shapelike", "_blank");
    }
}
