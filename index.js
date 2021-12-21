// declare dimensional constants
let GAME_DIMENSION = 1000; // side length of the battlefield
let PLAYER_SIZE = GAME_DIMENSION * 0.05; // the player defaults to 5% the size of the battlefield
let PLAYER_VELOCITY = PLAYER_SIZE * 15; // the player velocity is relative to its size
let PROJECTILE_SIZE = PLAYER_SIZE * 0.3; // base projectile size

// declare game variables
let projectiles = []; // array holding the projectiles, starts empty
let points = 0;
let lastRenderTime = 0; // used in the game loop to implement frame independence
let gameState = "title"; // gamestate can be title, game, pause, or over
let PauseStart = 0; // used when pausing/unpausing to ensure game resumes where it left off
let held_directions = []; // this array is used to manage which direction the player is moving

// declare balance constants
let PROJECTILE_FREQUENCY = 1; // base projectile frequency
let HOMING_STRENGTH = 1; // base homing frequency of HomingProjectiles
let ACCELERATION = 1; // base acceleration rate of AcceleratingProjectiles
let GROW_SPEED = 30; // base speed of growth for GrowingProjectiles
let GRAVITY = 1000; // base gravitational pull of GravityProjectiles
let SPLIT_CHANCE = 1; // base split chance of SplittingProjectiles

// retrieve the canvas and its context, set canvas dimensions
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = GAME_DIMENSION;
canvas.height = GAME_DIMENSION;

// eventListener for controlling the player, pausing/unpausing/restarting game
document.addEventListener('keydown', (e) => { // add eventListener waiting for keydown
    switch(e.code) // once a key is pressed
    {
        case 'KeyW': // if the code of the key pressed is W
            if (held_directions.indexOf('W') === -1) { // if W is not yet in held_directions, add it. Without this clause, the controls are 'sticky,' player keeps moving after all buttons released.
                held_directions.unshift('W'); // add 'W' to beginning of held_directions
            }
            break;
        case 'KeyA':
            if (held_directions.indexOf('A') === -1) { // ditto for A
                held_directions.unshift('A');
            }
            break;
        case 'KeyS':
            if (held_directions.indexOf('S') === -1) { // ditto for S
                held_directions.unshift('S');
            }
            break;
        case 'KeyD':
            if (held_directions.indexOf('D') === -1) { // ditto for D
                held_directions.unshift('D');
            }
            break;
        case 'Space': // if space is the key pressed
            switch(gameState) {
                case 'title': // if currently on title screen, switch to game
                    gameState = 'game';
                    window.requestAnimationFrame(main); // resume game
                    break;
                case 'game': // if currently on game, switch to paused
                    gameState = 'pause';
                    PauseStart = Date.now();
                    break;
                case 'pause': // if currently paused, resume game
                    gameState = 'game';
                    lastRenderTime += Date.now() - PauseStart; // update lastRenderTime to ensure game resumes where it left off
                    window.requestAnimationFrame(main); // resume game
                    break;
                case 'over': // if currently over, restart game
                    gameState = 'game';

                    // reset projectile size and frequency
                    let PROJECTILE_SIZE = PLAYER_SIZE * 0.3;
                    PROJECTILE_FREQUENCY = 1;

                    // empty projectiles and held_directions arrays
                    projectiles = [];
                    held_directions = [];

                    // recenter the player
                    player.x = (GAME_DIMENSION / 2) - (PLAYER_SIZE / 2);
                    player.y = player.x;

                    points = 0; // reset points

                    window.requestAnimationFrame(main); // resume game
                    break;
            }

            break;
    }
});

document.addEventListener('keyup', (e) => { // when a key is released

    let indexToRemove = -1;

    switch(e.code)
    {
        case 'KeyW':        // when W is released, remove it from held_directions
            indexToRemove = held_directions.indexOf('W');
            break;
        case 'KeyA': // ditto for A
            indexToRemove = held_directions.indexOf('A');
            break;
        case 'KeyS': // ditto for S
            indexToRemove = held_directions.indexOf('S');
            break;
        case 'KeyD': // ditto for D
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
        // center player
        this.x = (GAME_DIMENSION / 2) - (PLAYER_SIZE / 2);
        this.y = this.x;

        this.velocity = PLAYER_VELOCITY;
    }

    update(deltaTime) { // update the player's location, check for collision with projectiles
        switch (held_directions[0]) // move player according to key(s) held down
        {
            case 'W': // W/w is most recently held key
                player.y -= player.velocity * deltaTime; // move player up
                break;
            case 'A': // A/a is most recently held key 
                player.x -= player.velocity * deltaTime; // move player left
                break;
            case 'S': // S/s is most recently held key
                player.y += player.velocity * deltaTime; // move player down
                break;
            case 'D': // D/d is most recently held key
                player.x += player.velocity * deltaTime; // move player right
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
                gameState = 'over'; // the game is over
            }
        }
    }

    draw() {
        // set fillStyle to black, then draw player to canvas as a black square
        ctx.fillStyle = "black";
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
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
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.check = true;
        }

        if (this.check) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += this.points;
                return true;
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
    
    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as base action function
        
        if (Math.random() * HOMING_STRENGTH > 0.99) {        // randomly decide whether to redirect toward the player
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
        if (super.action()) return true; // perform all the same actions as the parent class action() function

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
        if (super.action()) return true; // perform all the same actions as the base class action() function 

        this.size += GROW_SPEED * deltaTime; // grow the projectile
    }

    draw() {
        ctx.fillStyle = `rgb(0, 142, 5)`; // change fill style to green
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a green square
    }
}

class GravityProjectile extends Projectile { // this class derives from base Projectile, and draws the player closer to it
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.points = 50; // update this.points to be 5
    }

    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as the base class action() function 

        let xDistance = player.x - this.x;
        let yDistance = player.y - this.y;
        let Distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        if (xDistance < 0) {
            player.x += this.size * GRAVITY * deltaTime / Distance;
        } else {
            player.x -= this.size * GRAVITY * deltaTime / Distance;
        }

        if (yDistance < 0) {
            player.y += this.size * GRAVITY * deltaTime / Distance;
        } else {
            player.y -= this.size * GRAVITY * deltaTime / Distance;
        }
    }

    draw() {
        ctx.fillStyle = `rgb(77, 0, 255)`; // change fill style to blue
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a blue square
    }
}

class SplittingProjectile extends Projectile { // this class derives from base Projectile, and splits into multiple projectiles
    constructor(player) {
        super(player); // perform all the same actions as base class constructor

        this.slope = (player.y - this.y) / (player.x - this.x);

        this.points = 1; // update this.points to be 5
    }

    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as the base class action() function 

        if (Math.random() * SPLIT_CHANCE > 0.99) {

            console.log(this);

            // make two new splitting projectiles
            // let split1 = this;
            // split1.size = (this.size / 2);
            // let split2 = split1;

            let split1 = new SplittingProjectile(player);

            split1.x = this.x;
            split1.y = this.y;
            split1.size = this.size / 2;
            split1.timeUntilPlayer = this.timeUntilPlayer;

            let split2 = new SplittingProjectile(player);

            split2.x = this.x;
            split2.y = this.y;
            split2.size = this.size / 2; 
            split2.timeUntilPlayer = this.timeUntilPlayer;

            // assign same x and y, or close to it (center of old?), but deflect trajectories.
            // split1.x = parent.x - (parent.size / 4)
            // split1.size = parent.size / 2

            // redirect split1 and split2 to phantom players
            // find angle of line from center of parent projectile to center of player, make phantoms orthogonal to that lines
            // OR
            // find slope of line connecting player midpoint and parent midpoint, find orthogonal line and 
            // place phantom players on that line, +/- starting from player midpoint then redirect split1 and 2 to those phantom players

 
            let orthogonal = -1/this.slope;
            let distance = 5;
            let targetX = this.x + (10 * this.dx);
            let targetY = this.y + (10 * this.dy);

            let phantom1X = targetX + (distance * orthogonal);
            let phantom1Y = targetY + (distance * orthogonal);

            split1.dx = (phantom1X - split1.x) / split1.timeUntilPlayer;
            split1.dy = (phantom1Y - split1.y) / split1.timeUntilPlayer;
            split1.slope = (phantom1Y - split1.y) / (phantom1X - split1.x);

            let phantom2X = targetX - (distance * orthogonal);
            let phantom2Y = targetX - (distance * orthogonal);

            split2.dx = (phantom2X - split2.x) / split1.timeUntilPlayer;
            split2.dy = (phantom2Y - split2.y) / split1.timeUntilPlayer;
            split2.slope = (phantom2Y - this.y) / (phantom2X - this.x);

            projectiles.push(split1);
            projectiles.push(split2);

            return true;
        }
    }

    draw() {
        // ctx.fillStyle = `rgb(255, 230, 0)`; // change fill style to yellow
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a yellow square
    }
}

let player = new Player(GAME_DIMENSION, PLAYER_SIZE, PLAYER_VELOCITY);

function main(currentTime) { // main function containing game loop
    switch (gameState) {
        case "title":
            ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);    // at the beginning of each frame, clear the canvas
            // display title screen
            ctx.fillstyle = "black" // change fill style to black
            ctx.textAlign = "center" // align text to the center
            
            ctx.font = "60px Futura" // change font to 60px Futura
            ctx.fillText("DODGE GAME", GAME_DIMENSION/2, 100); // print "DODGE GAME" centered in x, 100 in y

            ctx.font = "30px Futura" // change font to 30px Futura
            ctx.fillText("AVOID THE PROJECTILES AS LONG AS POSSIBLE", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50); // print message 50 above center of canvas
            ctx.fillText("USE W/A/S/D TO MOVE", GAME_DIMENSION/2, GAME_DIMENSION/2); // print message to center of canvas
            ctx.fillText("PRESS SPACEBAR TO BEGIN AND PAUSE", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50); // print message 50 below center of canvas
            break;
        case "game": // if the game is playing, perform all necessary actions
                ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);    // at the beginning of each frame, clear the canvas
                const deltaTime = (currentTime - lastRenderTime) / 1000;  // keep track of how much time has passed, this is to normalize game speed regardless of machine processing speed

                let newProjectile = Math.random() * PROJECTILE_FREQUENCY; // newProjectile is a variable used to determine whether a new projectile is spawned this frame

                if (newProjectile > 0.99999 ) {
                    // projectiles.push(new Projectile(player));
                    // projectiles.push(new BouncyProjectile(player));
                    // projectiles.push(new HomingProjectile(player));
                    // projectiles.push(new AcceleratingProjectile(player));
                    // projectiles.push(new GrowingProjectile(player));
                    // projectiles.push(new GravityProjectile(player));
                    projectiles.push(new SplittingProjectile(player));
                }

                lastRenderTime = currentTime;
            
                player.update(deltaTime); // update the player
                
                // for each projectile in the projectiles array 
                for (let i = 0; i < projectiles.length; i++) {
                    projectiles[i].update(deltaTime);

                    if (projectiles[i].action(deltaTime)) {
                        projectiles.splice(i, 1);
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


                window.requestAnimationFrame(main); 
            break;
        case "pause": // if the game is paused, do nothing but display pause message
                ctx.font = "30px Futura"
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText("PAUSED, SPACEBAR TO RESUME", GAME_DIMENSION/2, GAME_DIMENSION/2);
            break;
        case "over": // if the game is over, display gameover screen
            // display gameover message in 30 point Futura black to the center of the screen
            ctx.font = "30px Futura"; // change font to 30px Futura
            ctx.fillStyle = "black"; // change fill style to black
            ctx.textAlign = "center"; // change text alignment to center
            ctx.fillText("GAME OVER", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50); // print "GAME OVER" 50 above center of canvas
            ctx.fillText("POINTS: " + points, GAME_DIMENSION/2, GAME_DIMENSION/2); // display points in center of canvas
            ctx.fillText("TO START OVER, PRESS SPACEBAR", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50); // display message 50 below center of canvas
            break;       
    }
}

window.requestAnimationFrame(main);