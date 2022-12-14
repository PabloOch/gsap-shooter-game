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

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();

        const friction = 0.97; // Friction to slow the player over time
        this.velocity.x *= friction
        this.velocity.y *= friction

        // Player collision detection for the x-axis
        if (this.x + this.velocity.x + (this.radius + 15) <= canvas.width && this.x - this.radius + this.velocity.x >= 0) {
            this.x += this.velocity.x;
        } else {
            this.velocity.x = 0;
        }

        // Player collision detection for the y-axis
        if (this.y + this.velocity.y + (this.radius + 15) <= canvas.height && this.y - this.radius + this.velocity.y >= 0) {
            this.y += this.velocity.y;
        } else {
            this.velocity.y = 0;
        }
    }
}

class Projectile {
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
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}


const x = canvas.width / 2;
const y = canvas.height / 2;
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;

function init() { // Starts & restarts the game
    player = new Player(x, y, 10, 'violet'); // Creating the player object
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = '0'; // Resetting the template
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

function animate() { // Animates all array elements
    animationId = requestAnimationFrame(animate); // Continuously redraws the canvas to track all movement
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Sets black background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Sets canvas dimensions

    player.update(); // Draws player object

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
                    particles.push( // Add new particle
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
                    projectiles.splice(projectileIndex, 1); // Remove collided bullet
                } else { // When the enemy is destroyed
                    score += 150;
                    scoreEl.innerHTML = score; // Update template

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
    projectiles.push(new Projectile(
        player.x,
        player.y,
        5,
        'white',
        velocity
    ));
});

// Restart game button
buttonEl.addEventListener('click', () => {
    init(); // Start computation
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
    init(); // start computation
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
