const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl');
const modalEl = document.getElementById('endGame');
const modalScore = document.getElementById('endScore');
const buttonEl = document.getElementById('reset-btn');
const startButtonEl = document.getElementById('start-btn');
const startModalEl = document.getElementById('startGame');

// Sets the dimensions of the canvas to the dimensions of the window.
// Using a shorthand for the window innerWidth and innerHeight properties.
canvas.width = innerWidth;
canvas.height = innerHeight;


// A class to define the behaviors / properties of the player.
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    // A function to call on a player object that draws the player dot on the canvas and sets it initial properties.
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


// A class to define the behaviors and properties of each projectile.
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    // A function to call on a projectile object that draws the projectile and sets it initial properties.
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Redraws the projectile with its new updated velocity.
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// To define each enemy and its properties and actions.
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    // Creates and fills the enemy dot and sets its path towards the center of the screen.
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Re-draws the new updated enemy each time it's called (constantly).
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// A friction coefficient to apply to the particle effects to slow them the longer they've been active.
// The closer to 1 the least amount of friction is applied.
const friction = 0.99;

// This class is used to define the particle characteristics and behaviors.
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    // Creates and fills the enemy dot and sets its path towards the center of the screen.
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    // Re-draws the new updated enemy each time it's called (constantly).
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}



// Dividing each dimension by two places the player in the center of the canvas.
const x = canvas.width / 2;
const y = canvas.height / 2;

// The player object, initially null to update later.
let player;

// To track and manage each enemy and projectile.
let projectiles = [];
let enemies = [];
let particles = [];

// To store the specific animation frame being used in the canvas to end the game when the player is reached by an enemy.
let animationId;
let intervalId;
let score = 0;

// A function that can be called to reset all game values and reset the game.
function init() {
    player = new Player(x, y, 10, 'violet'); // Creating the player object.
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = '0';
}

// This function handles all logic related to enemy spawn locations and their movement.
function spawnEnemies() {
    // Each second run this block of code.
    intervalId = setInterval(() => {
        // Sets the radius of each enemy to be a random number between the specified values;
        const radius = Math.random() * (35-5) + 5;

        // Initially null values to update later in order to maintain their scope.
        let x;
        let y;

        // Spawns enemies along the left and right side of the screen 50% of the time and along the top and bottom sides the other 50% of the time.
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        // Sets the color of each projectile.
        // Using a string literal to allow for a random hue value.
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;


        // Calculates the angle between where the enemy spawns and the player (center).
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x);

        // Calculates the initial velocity values for each new enemy.
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        // Add each new enemy with their own unique initial values.
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

// A function to constantly redraw the canvas with the updated values for each object.
// Repeatedly recalls itself to ensure smooth updates.
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();


    for (let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index];

        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
        particle.update();
    }

    // Loop through the array starting at the back to avoid a rare instance of removing the wrong object.
    for (let index = projectiles.length - 1; index >= 0; index--) {
        const projectile = projectiles[index];

        projectile.update();

        // If projectile moves off the screen, remove them from the array.
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            // Removes the projectile from the array if one of the conditions occur, ending its computation.
            projectiles.splice(index, 1);
        }
    }

    // Loops through the array of enemies and for each element (enemy),
    // track its index and update its velocity, calculate its distance from the player (center),
    // and detect collisions with players and projectiles.
    // Loops from the end of the array to the front to avoid a rare case when removing objects where the wrong object is being removed.
    for (let index = enemies.length -1; index >= 0; index--) {
        const enemy = enemies[index];

        enemy.update();

        // Calculates the distance between where the click occurs and the player (center) using the built-in hypotenuse function.
        const distance = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        );


        // If projectile hits players, end the game.
        if (distance - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);
            clearInterval(intervalId);

            modalEl.style.display = 'block'; // Makes the game over modal visible.
            gsap.fromTo('#endGame', {scale: 0.8, opacity: 0}, {
                scale: 1,
                opacity: 1,
                ease: 'expo'
            });
            modalScore.innerHTML = score; // Places the global score value in the game over modal.
        }


        // Loop through the array of projectiles and for each one calculate its distance
        // from an enemy target and if a collision occurs remove the enemy from the array.
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {

           // Grabs the individual projectile element.
           const projectile = projectiles[projectileIndex];

           // Calculates the distance from where the click occurred and the player (center).
           const distance = Math.hypot(
               projectile.x - enemy.x,
                     projectile.y - enemy.y
           );

           // Enemy and projectile collide
           if (distance - enemy.radius - projectile.radius < 1) {

               // Creating the explosion particle effects when collisions occur.
               for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 5),
                                y: (Math.random() - 0.5) * (Math.random() * 5)
                            })
                    );
               }

               // This is where the enemy shrinks in radius when a collision occurs using gsap animation library.
               // If the enemy radius shrinks smaller than 7px it removes it and gives a higher score.
               if (enemy.radius - 10 > 7 ) {
                   score += 100;
                   scoreEl.innerHTML = score;

                   // Using gsap animation library to shrink the enemy size by 10px each time its collided with a projectile.
                   gsap.to(enemy, { // Despite it not registering as a resolved variable, it works.
                       radius: enemy.radius - 10
                   });
                     projectiles.splice(projectileIndex, 1);
               } else { // Reached when the projectile is destroyed from enough collisions.

                   score += 150; // 150 points for destroying an enemy dot.
                   scoreEl.innerHTML = score; // Keeps the score element updated.

                   // If a collision occurs remove it from the array.
                   enemies.splice(index, 1);
                   projectiles.splice(projectileIndex, 1);
               }
           }
        }
    }
}


// A shorthand to add a click listener to the window to determine when and where to shoot a projectile.
addEventListener('click', (event) => {

    // Calculates the angle between where the click occurs and the player (center).
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2);

    // Sets the velocity of the projectile each time a click spawns a new one.
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };

    // For each click in the canvas it adds a new projectile to the array with its initial properties.
    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
    ));
});

// Restart game button
buttonEl.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
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
    // Call the functions that start and maintain the game.
    init();
    animate();
    spawnEnemies();
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

