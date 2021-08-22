const framesPerSecond = 60;

let GAME_DIMENSION = 1000;
let PLAYER_SIZE = GAME_DIMENSION * 0.05;
let PLAYER_VELOCITY = PLAYER_SIZE * 15;
let PROJECTILE_SIZE = PLAYER_SIZE * 0.3;

let projectiles = [];

class Player {
    constructor() {
        // center player
        this.x = (GAME_DIMENSION / 2) - (PLAYER_SIZE / 2);
        this.y = this.x;

        this.velocity = PLAYER_VELOCITY;
    }

    update(deltaTime) {
        // move player according to key(s) held down
        switch (held_directions[0])
        {
            case 'W':
                player.y -= player.velocity * deltaTime;
                break;
            case 'A':
                player.x -= player.velocity * deltaTime;
                break;
            case 'S':
                player.y += player.velocity * deltaTime;
                break;
            case 'D':
                player.x += player.velocity * deltaTime;
                break;
        }
        
        // check each projectile for collission
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }
}



class Projectile {
    constructor(player) {
        switch(Math.floor(randomNumberFromRange(0,3))) {
            // above battlefield
            case 0:
                this.x = (Math.random() * (GAME_DIMENSION + (2 * PROJECTILE_SIZE))) - PROJECTILE_SIZE;
                this.y = -2 * PROJECTILE_SIZE;
                break;
            // right of battlefield
            case 1:
                this.x = GAME_DIMENSION + (2 * PROJECTILE_SIZE);
                this.y = (Math.random() * (GAME_DIMENSION + (2 * PROJECTILE_SIZE))) - PROJECTILE_SIZE;
                break;
            // below battlefield
            case 2:
                this.x = (Math.random() * (GAME_DIMENSION + (2 * PROJECTILE_SIZE))) - PROJECTILE_SIZE;
                this.y = GAME_DIMENSION + (2 * PROJECTILE_SIZE);
                break;
            // left of battlefield
            case 3:
                this.x = -2 * PROJECTILE_SIZE;
                this.y = (Math.random() * (GAME_DIMENSION + (2 * PROJECTILE_SIZE))) - PROJECTILE_SIZE;
                break;
        }

        // let timeUntilPlayer = (randomNumberFromRange(50, 100));
        // let timeUntilPlayer = 100;
        let timeUntilPlayer = randomNumberFromRange(2, 3);
        this.dx = (player.x - this.x) / timeUntilPlayer;
        this.dy = (player.y - this.y) / timeUntilPlayer;
        this.checkDeletion = false;
    }

    update(deltaTime) {
        // update position
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        // check for collision?

        if (this.x < GAME_DIMENSION && this.x > 0 && this.y <GAME_DIMENSION && this.y > 0) {
            this.checkDeletion = true
        }
    }

    draw() {
        // change fillstyle to appropriate
        ctx.fillStyle = "red";
        // draw
        ctx.fillRect(this.x, this.y, PROJECTILE_SIZE, PROJECTILE_SIZE);
    }
}

let player = new Player(GAME_DIMENSION, PLAYER_SIZE, PLAYER_VELOCITY);

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = GAME_DIMENSION;
canvas.height = GAME_DIMENSION;

// this array is used to manage which direction the player is moving
let held_directions = [];

document.addEventListener('keydown', (e) => {
    switch(e.code)
    {
        case 'KeyW':
            if (held_directions.indexOf('W') === -1) {
                held_directions.unshift('W'); 
            }
            break;
        case 'KeyA':
            if (held_directions.indexOf('A') === -1) {
                held_directions.unshift('A');
            }
            break;
        case 'KeyS':
            if (held_directions.indexOf('S') === -1) {
                held_directions.unshift('S');
            }
            break;
        case 'KeyD':
            if (held_directions.indexOf('D') === -1) {
                held_directions.unshift('D');
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {

    let indexToRemove = -1;

    switch(e.code)
    {
        case 'KeyW':
            indexToRemove = held_directions.indexOf('W');
            break;
        case 'KeyA':
            indexToRemove = held_directions.indexOf('A');
            break;
        case 'KeyS':
            indexToRemove = held_directions.indexOf('S');
            break;
        case 'KeyD':
            indexToRemove = held_directions.indexOf('D');
            break;
    }

    if (indexToRemove > -1) {
        held_directions.splice(indexToRemove, 1);
    }
});

function randomNumberFromRange(min, max) {
    return (Math.random() * (max - min + 1) + min);
}

// game loop
    // initiaLize
    // update
    // draw
        // clear canvas
        // draw character
        // draw projectiles

let lastRenderTime = 0;
let gameOver = false;

for (let i = 0; i < 5; i++) {
    projectiles.push(new Projectile(player));
}

function main(currentTime) {
    
    window.requestAnimationFrame(main);
    const deltaTime = (currentTime - lastRenderTime) / 1000;
    
    // if (deltaTime < 1 / framesPerSecond) return;
    if (randomNumberFromRange(0, 100) > 99.999) {
        projectiles.push(new Projectile(player));
    }
    lastRenderTime = currentTime;

    player.update(deltaTime);
    
    for (let i = 0; i < projectiles.length; i++) {
        // update position
        projectiles[i].update(deltaTime)
        // delete if projectile left screen
        if (projectiles[i].checkDeletion) {
            if (projectiles[i].x > GAME_DIMENSION || projectiles[i].x < 0 || projectiles[i].y > GAME_DIMENSION || projectiles[i].y < 0) {
                projectiles.splice(i, 1);
            }
        }
    }

    if (player.x + PLAYER_SIZE < 0) player.x = GAME_DIMENSION;
    if (player.x > GAME_DIMENSION )player.x = 0 - PLAYER_SIZE;
    if (player.y + PLAYER_SIZE < 0) player.y = GAME_DIMENSION;
    if (player.y > GAME_DIMENSION) player.y = 0 - PLAYER_SIZE;

        // draw
            // clear canvas
        ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);
            // draw character
        player.draw();

        for (let i = 0; i < projectiles.length; i++) {
            projectiles[i].draw();
        }
}

window.requestAnimationFrame(main);
