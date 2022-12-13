const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

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

// Dividing each dimension by two places the player in the center of the canvas.
const x = canvas.width / 2;
const y = canvas.height / 2;

// Creating the player object.
const player = new Player(x, y, 10, 'white');

// To track and manage each enemy and projectile.
const projectiles = [];
const enemies = [];

function spawnEnemies() {
    // Each second run this block of code.
    setInterval(() => {
        // Sets the radius of each enemy to be a random number between 5-30;
        const radius = Math.random() * (30-5) + 5;

        // Initially null values to update later in order to maintain their scope.
        let x;
        let y;

        // Spawns enemies along the left and right side of the screen 50% of the time and along the top and bottom sides the other 50% of teh time.
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
// To store the specific animation frame being used in the canvas to end the game when the player is reached by an enemy.
let animationId;

// A function to constantly redraw the canvas with the updated values for each object.
// Repeatedly recalls itself to ensure smooth updates.
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    projectiles.forEach((projectile, index) => {
        projectile.update();

        // If projectile moves off the screen, remove them from the array.
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            // Removes the projectile from the array if one of the conditions occur, ending its computation.
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    // Loops through the array of enemies and for each element (enemy),
    // track its index and update its velocity, calculate its distance from the player (center),
    // and detect collisions with players and projectiles.
    enemies.forEach((enemy, index) => {
        enemy.update();

        // Calculates the distance between where the click occurs and the player (center) using the built-in hypotenuse function.
        const distance = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        );


        // If projectile hits players, end the game.
        if (distance - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);
        }

        // Loop through the array of projectiles and for each one calculate its distance
        // from an enemy target and if a collision occurs remove the enemy from the array.
        projectiles.forEach((projectile, projectileIndex) => {
           const distance = Math.hypot(
               projectile.x - enemy.x,
                     projectile.y - enemy.y
           );

           // Enemy and projectile collide
           if (distance - enemy.radius - projectile.radius < 1) {

               // If a collision occurs remove it from the array.
               // Using setTimeout to make the removal smoother.
               setTimeout(() => {
                   enemies.splice(index, 1);
                   projectiles.splice(projectileIndex, 1);
               }, 0);
           }
        });
    });
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

// Call the functions that start and maintain the game.
animate();
spawnEnemies();
