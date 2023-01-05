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

        if (Math.random() < 0.5) {
            this.type = 'Homing';

            if (Math.random() < 0.5) {
                this.type = 'Spinning';

                if (Math.random() < 0.5) {
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
        this.radians += 0.1;

        if (this.type === 'Spinning') {
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;

            this.x = this.center.x + Math.cos(this.radians) * 20;
            this.y = this.center.y + Math.sin(this.radians) * 20;
        } else if (this.type === 'Homing') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);

            this.x += this.velocity.x;
            this.y += this.velocity.y;
        } else if (this.type === 'Homing Spinning') {
            const angle = Math.atan2(player.y - this.center.y, player.x - this.center.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);

            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;

            this.x = this.center.x + Math.cos(this.radians) * 20;
            this.y = this.center.y + Math.sin(this.radians) * 20;
        } else {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
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
        this.position = position;
        this.velocity = velocity;

        this.image = new Image();
        this.image.src = './img/lightningBolt.png';

        this.alpha = 1;

        gsap.to(this, {
            alpha: 0,
            duration: .4,
            repeat: -1,
            yoyo: true,
            ease: 'linear'
        });

        this.radians = 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x + this.image.width / 2, this.position.y + this.image.height / 2);
        ctx.rotate(this.radians);
        ctx.translate(-this.position.x - this.image.width / 2, -this.position.y - this.image.height / 2);
        ctx.drawImage(this.image, this.position.x, this.position.y);
        ctx.restore();
    }

    update() {
        this.draw();
        this.radians += 0.01;
        this.position.x += this.velocity.x;
    }
}
