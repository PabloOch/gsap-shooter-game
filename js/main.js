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

const friction = 0.99;

const x = canvas.width / 2;
const y = canvas.height / 2;
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;
let powerUps = [];
let frames = 0;



function init() { // Starts & restarts the game
    player = new Player(x, y, 10, 'white'); // Creating the player object
    projectiles = [];
    enemies = [];
    particles = [];
    powerUps = [];
    score = 0;
    scoreEl.innerHTML = '0'; // Resetting the template
    frames = 0;
}

function spawnEnemies() {
    intervalId = setInterval(() => { // Every 1s
        const radius = Math.random() * (35-5) + 5; // Random # between 5-35
        let x;
        let y;

        if (Math.random() < 0.5) { // Spawns enemies on the left & right
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {                   // Spawns enemies on the top & bottom
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`; // Randomly color enemies

        const angle = Math.atan2( // Angle between the player and enemy
            canvas.height / 2 - y,
            canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(x, y, radius, color, velocity)); // Creates an enemy
    }, 1000);
}

function spawnPowerUps() {
    setInterval(() => {
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
    }, 10000); // Every 10 seconds.
}

function createScoreLabels({ position, score }) { // Create dynamic score labels in the DOM.
    const scoreLabel = document.createElement('label'); // Creating label element.
    scoreLabel.innerHTML = score; // Setting its content to the necessary score that is passed in.
    scoreLabel.style.color = 'white'; // Setting it to white.
    scoreLabel.style.position = 'absolute'; // Setting its position property to absolute to allow overlaying.
    scoreLabel.style.left = position.x + 'px'; // collision position on the y-axis.
    scoreLabel.style.top = position.y + 'px'; // collision position on the x-axis.
    scoreLabel.style.userSelect = 'none'; // Make it un-highlightable by the user.
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

function animate() { // Animates all array elements
    animationId = requestAnimationFrame(animate); // Continuously redraws the canvas to track all movement
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Sets black background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Sets canvas dimensions
    frames++;

    player.update(); // Draws player object

    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];

        if (powerUp.position.x > canvas.width) {
            powerUps.splice(i, 1);
        } else {
            powerUp.update();
        }

        const distance = Math.hypot( // Calculate the distance between player & a power up.
            player.x - powerUp.position.x,
            player.y - powerUp.position.y
        );

        // Gain power-up
        if (distance < powerUp.image.height / 2 + player.radius) {
            powerUps.splice(i, 1);
            player.powerUp = 'MachineGun';
            player.color = 'yellow';

            setTimeout(() => {
                player.powerUp = '';
                player.color = 'white';
            }, 6000);
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
            projectiles.push(new Projectile(player.x, player.y, 5, 'yellow', velocity));
        }
    }


    for (let index = particles.length - 1; index >= 0; index--) { // Track all particles
        const particle = particles[index]; // Individual particle

        if (particle.alpha <= 0) { // Track when to remove particle effects
            particles.splice(index, 1);
        }
        particle.update(); // Update object values
    }

    for (let index = projectiles.length - 1; index >= 0; index--) { // Loop through and track each projectile
        const projectile = projectiles[index]; // Individual projectile
        projectile.update(); // Constantly update the object properties

        if (projectile.x + projectile.radius < 0 || // If projectile moves off the screen
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1); // Remove projectile from array
        }
    }

    for (let index = enemies.length -1; index >= 0; index--) { // Loop through and track each enemy
        const enemy = enemies[index];

        enemy.update(); // Update object values

        const distance = Math.hypot( // The distance between player & enemy
            player.x - enemy.x,
            player.y - enemy.y
        );

        // End game
        if (distance - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId); // End animation
            clearInterval(intervalId); // End interval

            modalEl.style.display = 'block'; // Toggle restart modal
            gsap.fromTo('#endGame', {scale: 0.8, opacity: 0}, { // Modal animation
                scale: 1,
                opacity: 1,
                ease: 'expo'
            });
            modalScore.innerHTML = score; // Update template
        }


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
                    score += 100;
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, { // Smooth shrink animation
                        radius: enemy.radius - 10
                    });
                    createScoreLabels({position: {x: projectile.x, y: projectile.y }, score: 100});
                    projectiles.splice(projectileIndex, 1); // Remove collided bullet
                } else { // When the enemy is destroyed.
                    score += 150;
                    scoreEl.innerHTML = score; // Update template
                    createScoreLabels({position: {x: projectile.x, y: projectile.y }, score: 150});

                    enemies.splice(index, 1); // Remove enemy.
                    projectiles.splice(projectileIndex, 1); // Remove bullet
                }
            }
        }
    }
}


// Spawn projectiles & calculate direction
addEventListener('click', (event) => {
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
});

addEventListener('mousemove', (event) => {
    mouse.position.x = event.clientX;
    mouse.position.y = event.clientY;
});

// Restart game button
buttonEl.addEventListener('click', () => {
    init(); // Start computation
    animate();
    spawnEnemies();
    spawnPowerUps();
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
