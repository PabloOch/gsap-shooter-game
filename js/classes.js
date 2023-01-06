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
        this.powerUp = '';
    }

    draw() { // Draw the player on the canvas.
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() { // Update the players movement each time this is called (repeatedly).
        this.draw(); // Call the function used to draw and color the player.

        const friction = 0.97; // Friction to slow the player over time. The closer to 1 the less friction there is.
        this.velocity.x *= friction // Applying the friction coefficient to the players speed in the x direction.
        this.velocity.y *= friction // Applying the friction coefficient to the players speed in the y direction.

        /**
         * Player collision detection for the x-axis.
         */
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
        this.type = 'Linear';
        this.radians = 0;
        this.center = { // Shorthand for { x: x, y: y }.
            x,
            y
        }

        if (Math.random() < 0.5) { // 50% chance to set enemy type to homing
            this.type = 'Homing';

            if (Math.random() < 0.5) { // Lesser chance to set enemy type to spinning (harder difficulty).
                this.type = 'Spinning';

                if (Math.random() < 0.5) { // Even lesser chance to set enemy type to homing and spinning
                    this.type = 'Homing Spinning';
                }
            }
        }
    }

    draw() { // Draw enemy on canvas
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() { // Update enemy movement in the x & y direction
        this.draw();
        this.radians += 0.1; // Increment radians each frame to apply to spinning enemies.

        if (this.type === 'Spinning') { // If type is spinning
            this.center.x += this.velocity.x; // Applying an x-velocity vector each frame to the invisible center that the enemy orbits.
            this.center.y += this.velocity.y; // Applying a y-velocity vector each frame to the invisible center that the enemy orbits.

            this.x = this.center.x + Math.cos(this.radians) * 20;
            this.y = this.center.y + Math.sin(this.radians) * 20;

        } else if (this.type === 'Homing') { // If type is homing
            const angle = Math.atan2(player.y - this.y, player.x - this.x); // Calculate angle between player and enemy.

            // When cos and sin are used in tandem they give us the perfect ratio needed to move an object along a circular path.
            this.velocity.x = Math.cos(angle); // Calculate the x velocity necessary to move towards the player.
            this.velocity.y = Math.sin(angle); // Calculate the y velocity necessary to move towards the player.

            this.x += this.velocity.x; // Applying the calculated x velocity to the enemies position.
            this.y += this.velocity.y; // Applying the calculated y velocity to the enemies position.

        } else if (this.type === 'Homing Spinning') { // If type is homing and spinning.
            const angle = Math.atan2(player.y - this.center.y, player.x - this.center.x); // Calculate angle between the player and the center point of enemy orbit.

            this.velocity.x = Math.cos(angle); // Tracking the circular velocity
            this.velocity.y = Math.sin(angle); // Tracking the circular velocity

            this.center.x += this.velocity.x; // Update the invisible center the enemy orbits around.
            this.center.y += this.velocity.y; // Update the invisible center the enemy orbits around.

            this.x = this.center.x + Math.cos(this.radians) * 20; // Applying product of the circular motion to the x position.
            this.y = this.center.y + Math.sin(this.radians) * 20; // Applying product of the circular motion to the y position.

        } else { // Default linear motion case

            this.x += this.velocity.x; // Applying basic velocity to the enemies x value.
            this.y += this.velocity.y; // Applying basic velocity to the enemies x value.
        }
    }
}

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

class PowerUp {
    constructor({position = {x: 0, y: 0}, velocity}) {
        this.position = position; // Initial position
        this.velocity = velocity; // Initial velocity

        this.image = new Image(); // Creating js image object.
        this.image.src = './img/lightningBolt.png'; // Setting its source path.

        this.alpha = 1; // Resetting the alpha value back to default.

        gsap.to(this, { // Creating the blinking animation on the power up.
            alpha: 0, // Reducing the object's alpha value
            duration: .4, // Over 4 seconds
            repeat: -1, // And repeat it over and over
            yoyo: true, // Then undo the changed values to give a yo-yo effect.
            ease: 'linear' // Smooth ease animation
        });

        this.radians = 0; // Initially 0 radians / rotation value.
    }

    draw() {
        ctx.save(); // Begin snapshot on the canvas.
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x + this.image.width / 2, this.position.y + this.image.height / 2); // Translate the canvas focus to the power up image
        ctx.rotate(this.radians); // Rotate the canvas at the new focus point.
        ctx.translate(-this.position.x - this.image.width / 2, -this.position.y - this.image.height / 2); // Undo the translation
        ctx.drawImage(this.image, this.position.x, this.position.y); // Draw the power up image on the canvas.
        ctx.restore(); // End the snapshot.
    }

    update() {
        this.draw(); // Redrawing the power up object each frame.
        this.radians += 0.01; // Apply an increment to the rotation angle each frame.
        this.position.x += this.velocity.x; // Apply a velocity vector to the power up each frame.
    }
}
