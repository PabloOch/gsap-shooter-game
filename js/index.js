const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl');
const modalEl = document.getElementById('endGame');
const modalScore = document.getElementById('endScore');
const buttonEl = document.getElementById('reset-btn');
const startButtonEl = document.getElementById('start-btn');
const startModalEl = document.getElementById('startGame');

canvas.width = innerWidth; // Window width
canvas.height = innerHeight; // Window height

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    draw() { // Draw the player on the canvas.
        ctx.beginPath(); // Creates a new 'path' on the canvas.
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); // Defines the location, size, and shape of the player.
        ctx.fillStyle = this.color; // Colors the player.
        ctx.fill(); // Applies the fillStyle above.
    }

    update() { // Update the player's movement each time this is called (repeatedly).
        this.draw(); // Call the function used to draw and color the player.

        const friction = 0.97; // Defining a friction amount to slow the player over time. The closer to 1 the less friction there is.
        this.velocity.x *= friction // Applying the friction coefficient to the players speed in the x direction.
        this.velocity.y *= friction // Applying the friction coefficient to the players speed in the y direction.

        /**
         * Create a boundary on the x-axis of the screen, detecting player collision with the left and right of the screen.
         */
        if (this.x + this.velocity.x + (this.radius + 15) <= canvas.width && this.x - this.radius + this.velocity.x >= 0) { // If the player is within the left and right edges of the screen.
            this.x += this.velocity.x; // Increase their speed by 1 each time this function is called.
        } else {
            this.velocity.x = 0; // Otherwise, if the player touches the left or right boundary => stop its movement, creating an x-axis boundary.
        }

        /**
         * Creating a boundary on the y-axis of the screen, detecting player collision with the top and bottom of the screen.
         */
        if (this.y + this.velocity.y + (this.radius + 15) <= canvas.height && this.y - this.radius + this.velocity.y >= 0) { // If player is within the top and bottom edges of the screen
            this.y += this.velocity.y; // Increase their speed by 1 each time this function is called.
        } else {
            this.velocity.y = 0; // Otherwise, if the player touches the top or bottom boundary => stop its movement, creating a y-axis boundary.
        }
    }
}

class Projectile {
    // Each projectile is initialized with a base x & y position, a radius (size), color, and base movement speed.
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.type = 'Linear';

        if (Math.random() < 0.5) {
            this.type = 'Homing';
        }
    }

    draw() { // Draw enemy on canvas
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() { // Update enemy movement in the x & y direction.
        this.draw();

        if (this.type === 'Homing') { // If an enemy spawns with its type as 'Homing' (50% chance) calculate the angle and velocity differently.
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);
        }

        // Setting the enemies position to the new values.
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// Setting a friction coefficient to apply to the particle effects.
const friction = 0.99;

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw(); // Redraw the particle each time this function is called.
        this.velocity.x *= friction; // Applying the friction over time.
        this.velocity.y *= friction; // Applying the friction over time.
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

// Setting initial location values to the center of the screen.
const x = canvas.width / 2;
const y = canvas.height / 2;

// Initializing all global necessary global variables.
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;

function init() { // Can be called to start/restart the game. Resets all game properties.
    player = new Player(x, y, 10, 'violet'); // Creating the player object & setting its properties.
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = '0'; // Resetting the score on the template.
}

/**
 * This function handles all enemy creations and their necessary calculations.
 */
function spawnEnemies() {
    intervalId = setInterval(() => { // Every 1s
        const radius = Math.random() * (30-5) + 5; // Sets the size of each enemy to a random value between 5-30
        let x;
        let y;

        if (Math.random() < 0.5) { // Spawns enemies on the left & right.
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {                   // Spawns enemies on the top & bottom.
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`; // Randomly color enemies

        const angle = Math.atan2( // Calculate the angle between the center of the screen and the enemy spawn location to determine which direction is towards the center.
            canvas.height / 2 - y,
            canvas.width / 2 - x);

        const velocity = { // Applies the result of the above calculation to finding the exact x:y ratio necessary to move the enemy in a straight line to the center.
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(x, y, radius, color, velocity)); // Creates an enemy and setting its individual properties and placing it in the array to track & manage.
    }, 1000);
}

/**
 * This function controls all animation used in the game. It starts the animation process and tracks each moving object (player, enemy, and projectiles), =>
 *  > to detect any collisions and determine how to handle them. It repeatedly re-calls itself until told otherwise to continuously redraw the canvas and update movements.
 * It alleviates memory leaks by looping through the array of each object from the back when managing any object removal =>
 *  > (enemy-projectile collision, projectile-boundary collision).
 * It also tracks and displays a user score while also creating a way for the player to lose and end all computation.
 * Additionally, used to remove and display the 'start game' and 'game over' modals.
 */
function animate() {
    animationId = requestAnimationFrame(animate); // Continuously re-calls itself to redraw the canvas, tracking all movement.
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Sets black background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Sets canvas dimensions and starting axis position.

    player.update(); // Calls the function to update player values to reflect changes.

    for (let index = particles.length - 1; index >= 0; index--) { // Track all particles.
        const particle = particles[index]; // Individual particle.

        if (particle.alpha <= 0) { // Track when to remove particle effects.
            particles.splice(index, 1); // Removes the individual particles after a short period.
        }
        particle.update(); // Update object values to reflect the change in position on the canvas.
    }

    // Looping through all the projectiles and tracking each one individually to perform actions on them.
    for (let index = projectiles.length - 1; index >= 0; index--) {
        const projectile = projectiles[index]; // grabbing each individual projectile.
        projectile.update(); // Constantly update the object properties.

        if (projectile.x + projectile.radius < 0 || // If projectile touches the left boundary.
            projectile.x - projectile.radius > canvas.width || // If projectile touches the right boundary.
            projectile.y + projectile.radius < 0 || // If the projectile touches the bottom boundary.
            projectile.y - projectile.radius > canvas.height // if the projectile touches the top boundary.
        ) {
            projectiles.splice(index, 1); // Remove projectile from array if any of the above conditions are true. This prevents memory leaks.
        }
    }

    // Looping through the array of enemies and tracking each one individually to apply actions on them.
    for (let index = enemies.length -1; index >= 0; index--) {
        const enemy = enemies[index];

        enemy.update(); // Update object values

        const distance = Math.hypot( // The distance between player & enemy
            player.x - enemy.x,
            player.y - enemy.y
        );

        // End game
        if (distance - player.radius - enemy.radius < 1) { // If a player and enemy collide.
            cancelAnimationFrame(animationId); // End animation
            clearInterval(intervalId); // End interval

            modalEl.style.display = 'block'; // Toggle restart game modal.
            gsap.fromTo('#endGame', {scale: 0.8, opacity: 0}, { // Game over modal animation.
                scale: 1,
                opacity: 1,
                ease: 'expo'
            });
            modalScore.innerHTML = score; // Reflect player score on the template.
        }


        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) { // Check each projectile for collisions
            const projectile = projectiles[projectileIndex];

            const distance = Math.hypot( // Calculate the distance between a projectile and an enemy using pythagorean theorem.
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );

            if (distance - enemy.radius - projectile.radius < 1) { // Enemy and projectile collide
                for (let i = 0; i < enemy.radius * 2; i++) { // Based on size of enemy, make more particles
                    particles.push( // Add new particle
                        new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 5),
                                y: (Math.random() - 0.5) * (Math.random() * 5)
                            })
                    );
                }

                if (enemy.radius - 10 > 7 ) { // Shrink enemy on collision
                    score += 100;
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, { // Smooth shrink animation
                        radius: enemy.radius - 10
                    });
                    projectiles.splice(projectileIndex, 1); // Remove collided bullet
                } else { // When the enemy is destroyed.
                    score += 150;
                    scoreEl.innerHTML = score; // Update template

                    enemies.splice(index, 1); // Remove enemy
                    projectiles.splice(projectileIndex, 1); // Remove bullet
                }
            }
        }
    }
}

// Spawn projectiles & calculate direction
addEventListener('click', (event) => {

    const angle = Math.atan2( // Calculate the angle between the players location and where the click occurred.
        event.clientY - player.y,
        event.clientX - player.x);

    const velocity = { // The speed at which the projectile moves.
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };
    projectiles.push( // Using calculated values to create & store a new projectile object.
        new Projectile(player.x, player.y, 5, 'white', velocity
        ));
});

// Restart game button
buttonEl.addEventListener('click', () => {
    init(); // Start computation
    animate(); // Starts animation
    spawnEnemies(); // Spawns and controls enemies
    gsap.to('#endGame', {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'expo.in',
        onComplete: () => { // When the animation completes, remove the modal from the DOM.
            modalEl.style.display = 'none';
        }
    });
});

// Start game button
startButtonEl.addEventListener('click', () => {
    init(); // start computation
    animate(); // Start animation
    spawnEnemies(); // Spawns and controls enemies
    gsap.to('#startGame', {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'expo.in',
        onComplete: () => { // When the animation completes, remove the modal from the DOM.
            startModalEl.style.display = 'none';
        }
    });
});

// Listen for user input to determine player movement
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd' : player.velocity.x += 1; // If user presses D, move the player right (+x) by increasing it's x-velocity by 1.
            break;

        case 'a' : player.velocity.x -= 1; // If user presses A, move the player left (-x) by decreasing it's x-velocity by 1.
            break;

        case 's' : player.velocity.y += 1; // If user presses S, move the player down (-y) by decreasing it's y-velocity by 1.
            break;

        case 'w' : player.velocity.y -= 1; // If user presses W, move the player left (+y) by increasing it's y-velocity by 1.
            break;
    }
});
