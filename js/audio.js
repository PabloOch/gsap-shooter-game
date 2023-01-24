Howler.volume(0.2); // Set the volume to 10%.
const audio = {
    shoot: new Howl({
        src: './audio/shoot.wav',
        volume: 0.1
    }),
    damageTaken: new Howl({
        src: './audio/damageTaken.wav',
        volume: 0.1
    }),
    explode: new Howl({
        src: './audio/explosion.wav',
        volume: 0.1
    }),
    death: new Howl({
        src: './audio/Death.wav',
        volume: 0.1
    }),
    powerUp: new Howl({
        src: './audio/powerUp.wav',
        volume: 0.1
    }),
    select: new Howl({
        src: './audio/Select.wav',
        volume: 0.3
    }),
}
