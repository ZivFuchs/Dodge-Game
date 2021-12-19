const framesPerSecond = 60;

// declare dimensional constants
let GAME_DIMENSION = 1000; // side length of the battlefield
let PLAYER_SIZE = GAME_DIMENSION * 0.05;
let PLAYER_VELOCITY = PLAYER_SIZE * 15;
let PROJECTILE_SIZE = PLAYER_SIZE * 0.3; // base projectile size

let projectiles = []; // array holding the projectiles, starts empty
let points = 0;
let gameOver = false;
let lastRenderTime = 0; // used for the game loop to implement frame independence
let start = Date.now(); // used to store clock time when page loaded, to normalize first deltaTime

// declare balance constants
let PROJECTILE_FREQUENCY = 1; // base projectile frequency
let HOMING_FREQUENCY = 1; // base homing frequency
let ACCELERATION = 1; // base acceleration rate
let GROW_SPEED = 30; // base speed of growth for GrowingProjectiles



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

class Player {
    constructor() {
        this.x = (GAME_DIMENSION / 2) - (PLAYER_SIZE / 2); // center player in x dimension
        this.y = this.x; // center player in y dimension

        this.velocity = PLAYER_VELOCITY;
    }

    update(deltaTime) { // update the player's location, check for collision with projectiles
        switch (held_directions[0]) // move player according to key(s) held down
        {
            case 'W': // W/w is most recently held key
                player.y -= player.velocity * deltaTime; // move player up in y dimension
                break;
            case 'A': // A/a is most recently held key 
                player.x -= player.velocity * deltaTime; // move player left in x dimension
                break;
            case 'S': // S/s is most recently held key
                player.y += player.velocity * deltaTime; // move player down in y dimension 
                break;
            case 'D': // D/d is most recently held key
                player.x += player.velocity * deltaTime; // move player right in x dimension
                break;
        }

        // loop the character around the battlefield
        if (player.x + PLAYER_SIZE < 0) { // if player goes too far left
            player.x = GAME_DIMENSION; // move player to right side of the battlefield
        }
        if (player.x > GAME_DIMENSION) { // if player goes too far right
            player.x = 0 - PLAYER_SIZE; // move player to left side of the battlefield
        }
        if (player.y + PLAYER_SIZE < 0) { // if player goes too far up
            player.y = GAME_DIMENSION; // move player to bottom of the battlefield
        }
        if (player.y > GAME_DIMENSION) { // if player goes too far down
            player.y = 0 - PLAYER_SIZE; // move player to top of the battlefield
        }
        
        // check each projectile for collision
        for (let i = 0; i < projectiles.length; i++) {
            if ((projectiles[i].x + projectiles[i].size >= player.x && projectiles[i].x <= player.x + PLAYER_SIZE) && 
                (projectiles[i].y + projectiles[i].size >= player.y && projectiles[i].y <= player.y + PLAYER_SIZE)) { // if projectile intersects player
                gameOver = true; // the game is over
            }
        }
    }

    draw() { // used to draw the player to the canvas
        ctx.fillStyle = "black"; // set fill style to black
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE); // draw the player as a black square
    }
}

class Projectile {
    constructor(player) {
        this.size = PROJECTILE_SIZE * randomNumberFromRange(0.5, 1.5); // randomly assign each projectile a size

        switch(Math.floor(randomNumberFromRange(0,3))) { // randomly place each projectile outside of the game screen
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
        this.timeUntilPlayer = randomNumberFromRange(1, 2); // randomly assign the projectile a speed
        this.dx = (player.x - this.x) / this.timeUntilPlayer; // direct the projectile at the player in x dimension
        this.dy = (player.y - this.y) / this.timeUntilPlayer; // direct the projectile at the player in y dimension

        this.check = false; // don't check for deletion at first, only start checking once projectile has entered the battlefield
        this.points = 1; // the number of points associated with this projectile
    }

    update(deltaTime) { // update projectile's location each frame
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate
    }

    action() { // perform all necessary actions, such as removing the projectile if it leaves the battlefield
        if (this.x < GAME_DIMENSION - this.size && this.x > 0   // if the projectile has entered the battlefield, start checking it for deletion  
            && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        if (this.check) { // check if projectile has left the battlefield, if so delete it and add correct number of points
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += this.points; // add point(s)
                return true; // to indicate the projecitle has left the battlefield, used to remove elements from projectiles[] as appropriate
            }
        }
    }

    draw() { // used to draw the projectile to the canvas
        ctx.fillStyle = "red"; // set fills tyle to red
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile as a red square to canvas
    }
}

class BouncyProjectile extends Projectile { // this projectile derives from Projectile base class, and bounces against the walls instead
                                            // of leaving the battefield and being removed
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.points = 5; // update points value to be 5, 5 points for each bounce
    }

    action() {
        if (this.x < GAME_DIMENSION - this.size && this.x > 0         // if the projectile has fully entered the battlefield, start checking it
            && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true
        }

        if (this.check) {     // once the projectile has entered the battlefield, start checking it
            if (this.x < 0 || this.x > GAME_DIMENSION - this.size) { // if projectile contacts left or right wall
                this.dx *= -1; // reverse velocity in x direction, thus 'bouncing' off the wall
                points += this.points; // add 5 points
            }
            if (this.y < 0 || this.y > GAME_DIMENSION - this.size) { // if projectile contacts top or bottom wall
                this.dy *= -1; // reverse velocity in y direction, thus 'bouncing' off the wall
                points += this.points; // add 5 points
            }
        }
    }

    draw() { // used to draw the projectile to the canvas
        ctx.fillStyle = `rgb(252, 125, 255)`; // set fill style to pink
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to the canvas as a pink square
    }
}

class HomingProjectile extends Projectile { // this projectile derives from Projectile base class, and homes onto the player periodically
    constructor(player) {
        super(player); // perform all the same actions as base constructor
        this.points = 5; // update points to be 5
    }
    
    action() {
        super.action(); // perform all the same actions as base action function
        
        if (Math.random() * HOMING_FREQUENCY > 0.99) {        // randomly decide whether to redirect toward the player
            this.timeUntilPlayer = randomNumberFromRange(1, 2); // assign new speed
            this.dx = (player.x - this.x) / this.timeUntilPlayer; // assign new velocity in x dimension
            this.dy = (player.y - this.y) / this.timeUntilPlayer; // assign new velocity in y dimension
        }
    }

    draw() { // used to draw the projectile to the canvas
        ctx.fillStyle = "purple"; // update fill style to purple
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a purple square
    }
}

class AcceleratingProjectile extends Projectile { // this class derives from Projectile base class, and accelerates as it moves
    constructor(player) {
        super(player); // perform all the same actions as base constructor
        this.points = 5; // update points to be 5

    }

    action(deltaTime) {
        super.action(); // perform all the same actions as the parent class action() function

        // accelerate the projectile
        this.dx += (ACCELERATION * this.dx * deltaTime); // accelerate in x dimension
        this.dy += (ACCELERATION * this.dy * deltaTime); // accelerate in y dimension
    }

    draw() { // used to draw the projectile to the canvas
        ctx.fillStyle = "orange";  // update fill style to orange
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as an orange square
    }
}

class GrowingProjectile extends Projectile { // this class derives from base Projectile, and grows as it moves
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.points = 5; // update this.points to be 5
    }

    action(deltaTime) {
        super.action(); // perform all the same actions as the base class action() function 

        this.size += GROW_SPEED * deltaTime; // grow the projectile
    }

    draw() {
        ctx.fillStyle = `rgb(0, 142, 5)`; // change fill style to green
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a green square
    }
}

async function titleScreen() {
    // display title screen
    ctx.fillstyle = "black" // change fill style to black
    ctx.textAlign = "center" // align text to the center
    
    ctx.font = "60px Futura" // change font to 60px Futura
    ctx.fillText("DODGE GAME", GAME_DIMENSION/2, 100); // print "DODGE GAME" centered in x, 100 in y

    ctx.font = "30px Futura" // change font to 30px Futura
    ctx.fillText("AVOID THE PROJECTILES AS LONG AS POSSIBLE", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50); // print message 50 above center of canvas
    ctx.fillText("USE W/A/S/D TO MOVE", GAME_DIMENSION/2, GAME_DIMENSION/2); // print message to center of canvas
    ctx.fillText("PRESS ANY KEY TO BEGIN", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50); // print message 50 below center of canvas

    await waitingKeypress(); // wait for key press
}

function waitingKeypress() {
    // once a kjy is pressed, remove the event listener, update lastRenderTime, and start the game
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

let player = new Player(GAME_DIMENSION, PLAYER_SIZE, PLAYER_VELOCITY);

function main(currentTime) { // main function containing game loop
    ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);    // at the beginning of each frame, clear the canvas

    if (!gameOver) {    // if the game isn't over, perform all necessary actions
        window.requestAnimationFrame(main);

        const deltaTime = (currentTime - lastRenderTime) / 1000;  // keep track of how much time has passed, this is to normalize game speed regardless of machine processing speed
    
        let newProjectile = Math.random() * PROJECTILE_FREQUENCY; // newProjectile is a variable used to determine whether a new projectile is spawned this frame

        if (newProjectile > 0.99) {
            projectiles.push(new Projectile(player));
            projectiles.push(new BouncyProjectile(player));
            projectiles.push(new HomingProjectile(player));
            projectiles.push(new AcceleratingProjectile(player));
            projectiles.push(new GrowingProjectile(player));
        }

        lastRenderTime = currentTime;
    
        player.update(deltaTime); // update the player
        
        // for each projectile in the projectiles array 
        for (let i = 0; i < projectiles.length; i++) {
            projectiles[i].action(deltaTime); // perform necessary actions

            if (projectiles[i].update(deltaTime)) { // update the projectile's positions, check if it left the battlefield
                projectiles.splice(i, 1); // if so, remove the projectile
            }
        }

        player.draw(); // draw character
                
        for (let i = 0; i < projectiles.length; i++) { // for each projectile
            projectiles[i].draw(); // draw the projectile
        }

        ctx.font = "30px Futura"; // change font to 30px Futura
        ctx.fillStyle = "black"; // change fill style to black
        ctx.textAlign = "center"; // change text alignment to center
        ctx.fillText("POINTS: " + points, 875, 975); // display points in bottom right corner
    
        PROJECTILE_FREQUENCY += 0.001 * deltaTime; // increase projectile frequency
        PROJECTILE_SIZE += 0.001 * deltaTime; // increase projectile size
    } else { // if the game is over, display gameover screen
        
        // display gameover message in 30 point Futura black to the center of the screen
        ctx.font = "30px Futura"; // change font to 30px Futura
        ctx.fillStyle = "black"; // change fill style to black
        ctx.textAlign = "center"; // change text alignment to center
        ctx.fillText("GAME OVER", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50); // print "GAME OVER" 50 above center of canvas
        ctx.fillText("POINTS: " + points, GAME_DIMENSION/2, GAME_DIMENSION/2); // display points in center of canvas
        ctx.fillText("TO START OVER, PRESS ENTER", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50); // display message 50 below center of canvas
    }
}

titleScreen(); // call titlescreen function, displaying title screen and entering the game loop once a key is pressed