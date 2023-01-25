
function spawnEnemies() {
    intervalId = setInterval(() => { // Every 1s
        const radius = Math.random() * (35-5) + 5; // Random # between 5-35
        let x;
        let y;

        if (Math.random() < 0.5) { // Spawns enemies on the left & right.
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height; // Within the horizontal boundary.
        } else {                   // Spawns enemies on the top & bottom.
            x = Math.random() * canvas.width; // Within the vertical boundary.
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`; // Randomly color enemies.

        const angle = Math.atan2( // Angle between the player and enemy.
            canvas.height / 2 - y,
            canvas.width / 2 - x
        );

        // Cos and sin functions when used in tandem, give the perfect ratio to move an object anywhere along a unit circle.
        const velocity = { // Calculating the velocity to apply to the enemies.
            x: Math.cos(angle), // Adjacent side (CAH).
            y: Math.sin(angle) // Opposite side (SOH).
        };
        enemies.push(new Enemy(x, y, radius, color, velocity)); // Creates an enemy
    }, 1000); // 1s
}

function spawnPowerUps() {
    powerUpsIntervalId = setInterval(() => {
        powerUps.push( // Create new power up
            new PowerUp({
                position: {
                    x: -30, // Spawn to the left of the screen.
                    y: Math.random() * canvas.height // Within the screen
                },
                velocity: {
                    x: Math.random() + 1, // Random speed between 1 and 2.
                    y: 0
                }
            }));
    }, 9000); // Every 9 seconds.
}

function createScoreLabels({ position, score }) { // Create dynamic score labels in the DOM.
    const scoreLabel = document.createElement('label'); // Creating label element.
    scoreLabel.innerHTML = score; // Setting its content to the necessary score that is passed in.
    scoreLabel.style.color = 'white'; // Setting it to white.
    scoreLabel.style.position = 'absolute'; // Setting its position property to absolute to allow overlaying.
    scoreLabel.style.left = position.x + 'px'; // collision position on the y-axis.
    scoreLabel.style.top = position.y + 'px'; // collision position on the x-axis.
    scoreLabel.style.userSelect = 'none'; // Make it un-highlightable by the user.
    scoreLabel.style.pointerEvents = 'none'; // Make it un-clickable by the user.
    document.body.appendChild(scoreLabel); // Adding the label to the DOM.

    // Create the raise and fade away effect on the score label.
    gsap.to(scoreLabel, {
        opacity: 0,
        y: -30,
        duration: 0.75,
        onComplete: () => { // When animation completes
            scoreLabel.parentNode.removeChild(scoreLabel); // Garbage collection, remove the score label from the DOM.
        }
    });
}

function shoot({ x, y }) {
    if (game.active) {
        const angle = Math.atan2(
            y - player.y,
            x - player.x);

        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        };
        projectiles.push(
            new Projectile(player.x, player.y, 5, 'white', velocity
            ));
        audio.shoot.play();
    }
}
