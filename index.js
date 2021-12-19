const framesPerSecond = 60;

// declare dimensional constants
let GAME_DIMENSION = 1000;
let PLAYER_SIZE = GAME_DIMENSION * 0.05;
let PLAYER_VELOCITY = PLAYER_SIZE * 15;
let PROJECTILE_SIZE = PLAYER_SIZE * 0.3;

// declare balance constants
let PROJECTILE_FREQUENCY = 1;
let HOMING_FREQUENCY = 1;
let ACCELERATION = 1;
let GROW_SPEED = 30;

let projectiles = []; // array holding the projectiles, starts empty
let points = 0;

// initailze lastRenderTime, gameOver, and start, lastRenderTime will be overwritten with current time when game starts
let lastRenderTime = 0;
let gameOver = false;
let start = Date.now();

class Player {
    constructor() {
        // place player in the center of the battlefield
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

        // loop the character around the battlefield
        if (player.x + PLAYER_SIZE < 0) {
            player.x = GAME_DIMENSION;
        }
        if (player.x > GAME_DIMENSION) {
            player.x = 0 - PLAYER_SIZE;
        }
        if (player.y + PLAYER_SIZE < 0) {
            player.y = GAME_DIMENSION;
        }
        if (player.y > GAME_DIMENSION) {
            player.y = 0 - PLAYER_SIZE;
        }
        
        // check each projectile for collision
        for (let i = 0; i < projectiles.length; i++) {
            if ((projectiles[i].x + projectiles[i].size >= player.x && projectiles[i].x <= player.x + PLAYER_SIZE) && (projectiles[i].y + projectiles[i].size >= player.y && projectiles[i].y <= player.y + PLAYER_SIZE)) {
                gameOver = true;
            }
        }
    }

    draw() {
        // draw the player as a black square
        ctx.fillStyle = "black";
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }
}

class Projectile {
    constructor(player) {
        this.size = PROJECTILE_SIZE * randomNumberFromRange(0.5, 1.5); // randomly assign each projectile a size

        // randomly place each projectile outside of the game screen
        switch(Math.floor(randomNumberFromRange(0,3))) {
            case 0: // above battlefield
                this.x = (Math.random() * (GAME_DIMENSION + (2 * this.size))) - this.size;
                this.y = -2 * this.size;
                break;
            case 1: // right of battlefield
                this.x = GAME_DIMENSION + (2 * this.size);
                this.y = (Math.random() * (GAME_DIMENSION + (2 * this.size))) - this.size;
                break;
            case 2: // below battlefield
                this.x = (Math.random() * (GAME_DIMENSION + (2 * this.size))) - this.size;
                this.y = GAME_DIMENSION + (2 * this.size);
                break;
            case 3: // left of battlefield
                this.x = -2 * this.size;
                this.y = (Math.random() * (GAME_DIMENSION + (2 * this.size))) - this.size;
                break;
        }

        // randomly assign each projectile a velocity
        this.timeUntilPlayer = randomNumberFromRange(1, 2);
        this.dx = (player.x - this.x) / this.timeUntilPlayer;
        this.dy = (player.y - this.y) / this.timeUntilPlayer;

        this.check = false; // don't check for deletion at first, only start checking once projectile has entered the battlefield
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate

        // if the projectile has entered the battlefield, start checking it for deletion  
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        // check if projectile has left the battlefield
        if (this.check) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += 1;
                return true;
            }
        }
    }

    draw() {
        // draw the projectile as a red square
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class BouncyProjectile extends Projectile {
    constructor(player) {
        super(player);
    }

    update(deltaTime) {
        // update position
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate

        // if the projectile has fully entered the battlefield, start checking it
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        // once the projectile has entered the battlefield, start checking it
        if (this.check) {
            // bounce off walls, if necessary, add 5 points if so
            if (this.x < 0 || this.x > GAME_DIMENSION - this.size) {
                this.dx *= -1;
                points += 5;
            }
            if (this.y < 0 || this.y > GAME_DIMENSION - this.size) {
                this.dy *= -1;
                points += 5;
            }
        }
    }

    draw() {
        // draw the projectile as a pink square
        ctx.fillStyle = `rgb(252, 125, 255)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

async function titleScreen() {
    // display title screen
    ctx.fillstyle = "black"
    ctx.textAlign = "center"
    
    ctx.font = "60px Futura"
    ctx.fillText("DODGE GAME", GAME_DIMENSION/2, 100);

    ctx.font = "30px Futura"
    ctx.fillText("AVOID THE PROJECTILES AS LONG AS POSSIBLE", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50);
    ctx.fillText("USE W/A/S/D TO MOVE", GAME_DIMENSION/2, GAME_DIMENSION/2);
    ctx.fillText("PRESS ANY KEY TO BEGIN", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50);

    await waitingKeypress(); // wait for key press
}

function waitingKeypress() {
    // once a kjey is pressed, remove the event listener, update lastRenderTime, and start the game
    return new Promise((resolve) => {
        document.addEventListener('keydown', onKeyHandler);

        function onKeyHandler(e) {
            document.removeEventListener('keydown', onKeyHandler);
            resolve();
            lastRenderTime = (Date.now() - start);

            window.requestAnimationFrame(main);
        }
    })
}

class HomingProjectile extends Projectile {
    update(deltaTime) {
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate

        // if the projectile has entered the battlefield, start checking it for deletion  
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        // check if projectile has left the battlefield
        if (this.check) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += 10;
                return true;
            }
        }

        // randomly decide whether to redirect toward the player
        if (Math.random() * HOMING_FREQUENCY > 0.99) {
            // assign new velocity
            this.timeUntilPlayer = randomNumberFromRange(1, 2);
            this.dx = (player.x - this.x) / this.timeUntilPlayer;
            this.dy = (player.y - this.y) / this.timeUntilPlayer;
        }
    }

    draw() {
        // draw the projectile as a purple square
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class AcceleratingProjectile extends Projectile {
    update(deltaTime) {
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate

        // if the projectile has entered the battlefield, start checking it for deletion  
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        // check if projectile has left the battlefield
        if (this.check) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += 3;
                return true;
            }
        }

        // accelerate the projectile
        this.dx += (ACCELERATION * this.dx * deltaTime); 
        this.dy += (ACCELERATION * this.dy * deltaTime);
    }

    draw() {
        // draw the projectile as an orange square
        ctx.fillStyle = "orange";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class GrowingProjectile extends Projectile {
    update(deltaTime) {
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate

        // if the projectile has entered the battlefield, start checking it for deletion  
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        // check if projectile has left the battlefield
        if (this.check) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += 3;
                return true;
            }
        }

        this.size += GROW_SPEED * deltaTime; // grow the projectile
    }

    draw() {
        // draw the projectile as a green square
        ctx.fillStyle = `rgb(0, 142, 5)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

let player = new Player(GAME_DIMENSION, PLAYER_SIZE, PLAYER_VELOCITY);

// retrieve the canvas and set its dimensions
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = GAME_DIMENSION;
canvas.height = GAME_DIMENSION;

let held_directions = []; // this array is used to manage which direction the player is moving

// this keydown event listener is used to control the player, and reset the game
document.addEventListener('keydown', (e) => {
    switch(e.code)
    {
        case 'KeyW':
            // if W is not yet in held_directions, add it. Without this, the controls are 'sticky,' player keeps moving after all buttons released.
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
        case 'Enter':
            // if the user hits enter, restart the game
            gameOver = false;

            let PROJECTILE_SIZE = PLAYER_SIZE * 0.3;    // reset projectile size
            PROJECTILE_FREQUENCY = 1;                   // reset projectile frequency

            // empty projectiles and held_directions arrays
            projectiles = [];
            held_directions = [];
            
            // recenter the player
            player.x = (GAME_DIMENSION / 2) - (PLAYER_SIZE / 2);
            player.y = player.x;

            // reset points to 0
            points = 0;

            // start a new game
            window.requestAnimationFrame(main);
            break;
    }
});

document.addEventListener('keyup', (e) => {

    let indexToRemove = -1;

    switch(e.code)
    {
        // when W is released, remove it from held_directions
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

// input two numnbers, min and max
// return random number between min and max
function randomNumberFromRange(min, max) {
    return (Math.random() * (max - min + 1) + min);
}

function main(currentTime) {
    // at the beginning of each frame, clear the canvas
    ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);

    // if the game isn't over, perform all necessary actions
    if (!gameOver) {
        window.requestAnimationFrame(main);
        // keep track of how much time has passed, this is to normalize game speed regardless of machine processing speed
        const deltaTime = (currentTime - lastRenderTime) / 1000;
    
        // newProjectile is a variable used to determine whether a new projectile is spawned this frame
        let newProjectile = Math.random() * PROJECTILE_FREQUENCY;

        if (newProjectile > 0.99) {
            // projectiles.push(new Projectile(player));
            // projectiles.push(new BouncyProjectile(player));
            // projectiles.push(new HomingProjectile(player));
            // projectiles.push(new AcceleratingProjectile(player));
            projectiles.push(new GrowingProjectile(player));
        }

        lastRenderTime = currentTime;
    
        // update the player
        player.update(deltaTime);
        
        // for each projectile in the projectiles array, update it. If it is flagged for deletion, remove it from projectiles.
        for (let i = 0; i < projectiles.length; i++) {
            // update position
            if (projectiles[i].update(deltaTime)) {
                projectiles.splice(i, 1);
            }
        }

        // draw character
        player.draw();
                
        // draw projectiles 
        for (let i = 0; i < projectiles.length; i++) {
            projectiles[i].draw();
        }
        // draw score
        ctx.font = "30px Futura";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("POINTS: " + points, 875, 975);
    
        // increase projectile frequency and size
        PROJECTILE_FREQUENCY += 0.001 * deltaTime;
        PROJECTILE_SIZE += 0.001 * deltaTime;
    } else {
        // if the game is over, display gameover screen

        // display gameover message in 30 point Futura black to the center of the screen
        ctx.font = "30px Futura";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50);
        ctx.fillText("POINTS: " + points, GAME_DIMENSION/2, GAME_DIMENSION/2);
        ctx.fillText("TO START OVER, PRESS ENTER", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50);
    }
}

titleScreen();