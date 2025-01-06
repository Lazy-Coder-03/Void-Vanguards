function drawUI() {
    // Reset transformations to screen coordinates
    resetMatrix();

    // Draw EXP bar
    fill(255);
    rect(10, 10, 200, 10);
    fill(0, 255, 0);
    rect(10, 10, map(currentExp, 0, expNeeded, 0, 200), 10);

    // Draw health bar
    fill(255);
    rect(10, 30, 200, 10);
    fill(255, 0, 0);
    rect(10, 30, map(player.health, 0, Drone.MAX_HEALTH, 0, 200), 10);

    // Draw stats
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
            player.damage += Math.round((10 + 0.025 * player.damage));
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

function drawCritEffects() {
    for (let i = critEffects.length - 1; i >= 0; i--) {
        let effect = critEffects[i];

        push();
        textSize(effect.size);
        textAlign(CENTER, CENTER);
        fill(255, 255, 0, map(effect.lifespan, 0, 60, 0, 255)); // Fade out over time
        text(effect.emoji, effect.x, effect.y);
        textSize(effect.size / 3); // Smaller text for "CRIT!"
        fill(255, map(effect.lifespan, 0, 60, 0, 255));
        text(effect.text, effect.x, effect.y - 50);
        pop();

        effect.lifespan--;
        if (effect.lifespan <= 0) {
            critEffects.splice(i, 1); // Remove the effect when its lifespan ends
        }
    }
}
