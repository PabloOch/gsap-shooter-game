const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl');
const modalEl = document.getElementById('endGame');
const modalScore = document.getElementById('endScore');
const buttonEl = document.getElementById('reset-btn');
const startButtonEl = document.getElementById('start-btn');
const startModalEl = document.getElementById('startGame');

const mouse = {
    position: {
        x: 0,
        y: 0
    }
}

canvas.width = innerWidth; // Window width
canvas.height = innerHeight; // Window height

const x = canvas.width / 2;
const y = canvas.height / 2;
const friction = 0.99;
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;
let powerUps = [];
let frames = 0;
let backgroundParticles = [];
let game = {
    active: false
}



function init() { // Starts & restarts the game
    player = new Player(x, y, 10, 'white'); // Creating the player object
    projectiles = []; // Reset all projectiles.
    enemies = []; // Reset all enemies.
    particles = []; // Reset all particle effects.
    powerUps = []; // Reset all power ups.
    score = 0; // Reset score.
    scoreEl.innerHTML = '0'; // Resetting the template.
    frames = 0; // Reset frame count.
    backgroundParticles = []; // Reset background particles.
    game = {
        active: true
    }

    const gridSpacing = 30; // Spacing between each grid line.

    for (let x = 0 ; x < canvas.width + gridSpacing; x += gridSpacing) {
        for (let y = 0; y < canvas.height + gridSpacing; y += gridSpacing) {
            backgroundParticles.push(new BackgroundParticle({
                position: {
                    x, // x: x
                    y  // y: y
                },
                radius: 3
            }));
        }
    }
}


function animate() { // Animates all array elements.
    animationId = requestAnimationFrame(animate); // Continuously redraws the canvas to track all movement.
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Sets black background.
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Sets canvas dimensions.
    frames++;

    backgroundParticles.forEach((backgroundParticle, index) => {
        backgroundParticle.draw();

        const distance = Math.hypot(player.x - backgroundParticle.position.x, player.y - backgroundParticle.position.y);

        if (distance < 100) {
            backgroundParticle.alpha = 0;

            if (distance > 70) {
                backgroundParticle.alpha = 0.5;
            }
        } else if (distance > 100 && backgroundParticle.alpha < 0.1) {
            backgroundParticle.alpha += 0.01;
        } else if (distance > 100 && backgroundParticle.alpha > 0.1) {
            backgroundParticle.alpha -= 0.01;
        }
    });

    player.update(); // Draws player object

    // Looping from the back of the array helps when rapidly removing elements from the array.
    for (let i = powerUps.length - 1; i >= 0; i--) { // Looping through all power ups from the back of the array.
        const powerUp = powerUps[i];

        if (powerUp.position.x > canvas.width) { // If the power up reaches the right boundary.
            powerUps.splice(i, 1); // Remove it from computation.
        } else {              // Otherwise
            powerUp.update(); // Update its position as usual.
        }

        const distance = Math.hypot( // Calculate the distance between player & a power up.
            player.x - powerUp.position.x,
            player.y - powerUp.position.y
        );

        // Gain power-up
        if (distance < powerUp.image.height / 2 + player.radius) { // Player and power up collide.
            audio.powerUp.play(); // Play power up sound.
            powerUps.splice(i, 1); // Remove it from computation after pick up.
            player.powerUp = 'MachineGun'; // Updating player power up property.
            player.color = 'yellow'; // Changing player color to reflect power-up pick up.

            setTimeout(() => { // After 6s, remove the power up ability.
                player.powerUp = ''; // Reset player power-up property.
                player.color = 'white'; // Return player to original color.
            }, 6000); // 6s.
        }
    }

    // If player has a machine gun power up active.
    if (player.powerUp === 'MachineGun') {

        const angle = Math.atan2( // Calculating the angle between where the mouse is and the player.
            mouse.position.y - player.y,
            mouse.position.x - player.x
        );

        const velocity = { // Setting power-up projectile velocity.
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        };

        // Every 3 frames, spawn a new projectile during power-up duration.
        if (frames % 3 === 0) {
            projectiles.push(new Projectile(player.x, player.y, 5, 'yellow', velocity)); // Create a new projectile every 3 frames.
        }
        if (frames % 6 === 0) {
            audio.shoot.play();
        }
    }


    // Looping through all particles from the back of the array.
    for (let index = particles.length - 1; index >= 0; index--) { // Track all particles
        const particle = particles[index]; // Individual particle

        if (particle.alpha <= 0) { // Track when to remove particle effects
            particles.splice(index, 1);
        }
        particle.update(); // Update object values
    }

    // Looping from the back of the array to help avoid removing the wrong element when rapidly removing elements.
    for (let index = projectiles.length - 1; index >= 0; index--) { // Loop through and track each projectile.
        const projectile = projectiles[index]; // Individual projectile.
        projectile.update(); // Constantly update the object properties.

        // Track if projectile hits the screen boundaries.
        if (projectile.x + projectile.radius < 0 || // If projectile moves off the screen
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1); // Remove projectile from array
        }
    }

    // Looping from the back of the array to help with element removal.
    for (let index = enemies.length -1; index >= 0; index--) { // Loop through and track each enemy
        const enemy = enemies[index];

        enemy.update(); // Update object values

        const distance = Math.hypot( // The distance between player & enemy
            player.x - enemy.x,
            player.y - enemy.y
        );

        // End game
        if (distance - player.radius - enemy.radius < 1) { // Enemy and player collision.
            cancelAnimationFrame(animationId); // End animation
            clearInterval(intervalId); // End interval
            audio.death.play(); // Play death sound.
            game.active = false; // Set game to inactive.

            modalEl.style.display = 'block'; // Toggle restart modal
            gsap.fromTo('#endGame', {scale: 0.8, opacity: 0}, { // Modal animation
                scale: 1,
                opacity: 1,
                ease: 'expo'
            });
            modalScore.innerHTML = score; // Update template
        }


        // Looping through all projectiles to manage and track their properties and collisions.
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) { // Check each projectile for collisions
            const projectile = projectiles[projectileIndex];

            const distance = Math.hypot( // The distance between a projectile and an enemy
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );

            if (distance - enemy.radius - projectile.radius < 1) { // Enemy and projectile collide
                for (let i = 0; i < enemy.radius * 2; i++) { // Based on size of enemy, make more particles
                    particles.push( // Add a new particle.
                        new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 5),
                                y: (Math.random() - 0.5) * (Math.random() * 5)
                            })
                    );
                }

                if (enemy.radius - 10 > 7 ) { // Shrink enemy on collision.
                    audio.damageTaken.play();
                    score += 100; // Increment score.
                    scoreEl.innerHTML = score; // Update template

                    gsap.to(enemy, { // Smooth shrink animation
                        radius: enemy.radius - 10
                    });
                    createScoreLabels({position: {x: projectile.x, y: projectile.y }, score: 100}); // Create score label each collision
                    projectiles.splice(projectileIndex, 1); // Remove collided bullet
                } else { // When the enemy is destroyed.
                    score += 150; // Increment score
                    scoreEl.innerHTML = score; // Update template
                    createScoreLabels({position: {x: projectile.x, y: projectile.y }, score: 150}); // Create a score label for each elimination.

                    // If an enemy is destroyed, change the background particles to the color of the destroyed enemy.
                    backgroundParticles.forEach((backgroundParticle) => {
                        gsap.set(backgroundParticle, {
                           color: 'white',
                            alpha: 1
                        });
                        gsap.to(backgroundParticle, {
                           color: enemy.color,
                            alpha: 0.1
                        });
                        // backgroundParticle.color = enemy.color;
                    });
                    audio.explode.play();
                    enemies.splice(index, 1); // Remove enemy.
                    projectiles.splice(projectileIndex, 1); // Remove bullet
                }
            }
        }
    }
}


// Spawn projectiles & calculate direction
addEventListener('click', (event) => {
    if (game.active) {
        const angle = Math.atan2(
            event.clientY - player.y,
            event.clientX - player.x);

        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        };
        projectiles.push(
            new Projectile(player.x, player.y, 5, 'white', velocity
            ));
        audio.shoot.play();
    }
});

addEventListener('mousemove', (event) => { // Track exact mouse position.
    mouse.position.x = event.clientX;
    mouse.position.y = event.clientY;
});

// Restart game button
buttonEl.addEventListener('click', () => {
    audio.select.play();
    init(); // Start computation
    animate(); // Begin animation
    spawnEnemies(); // Spawn enemies
    spawnPowerUps(); // Spawn player power ups
    gsap.to('#endGame', {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'expo.in',
        onComplete: () => {
            modalEl.style.display = 'none';
        }
    });
});

// Start game button
startButtonEl.addEventListener('click', () => {
    audio.select.play();
    init(); // start computation
    animate();
    spawnEnemies();
    spawnPowerUps();
    gsap.to('#startGame', {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'expo.in',
        onComplete: () => {
            startModalEl.style.display = 'none';
        }
    });
});

// Listen for player movement
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd' : player.velocity.x += 1;
            break;

        case 'a' : player.velocity.x -= 1;
            break;

        case 's' : player.velocity.y += 1;
            break;

        case 'w' : player.velocity.y -= 1;
            break;
    }
});
