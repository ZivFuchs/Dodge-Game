// declare dimensional constants
const GAME_DIMENSION = 1000; // side length of the battlefield
const PLAYER_SIZE = GAME_DIMENSION * 0.05; // the player defaults to 5% the size of the battlefield
const PLAYER_SPEED = PLAYER_SIZE * 15; // the player velocity is relative to its size

// declare sound constants
const NEW_GAME_NOISE = '/sounds/new game.wav'; // new game
const NEW_GAME_VOLUME = 0.05;
const GAME_OVER_NOISE = '/sounds/gameOver.wav'; // game over
const GAME_OVER_VOLUME = 0.05;
const BOUNCE_NOISE = '/sounds/Bounce.wav'; // bounce sound credit to https://www.youtube.com/watch?v=hwn3Ox67yHQ
const BOUNCE_VOLUME = 0.3;
const GRAVITY_NOISE = '/sounds/gravity4.wav'; // gravity (louder closer, bigger)
const GRAVITY_VOLUME = 0.1;
const ACCELERATING_NOISE = '/sounds/accelerate.wav'; // accelerating
const ACCLERATING_VOLUME = 0.1;
const ACCELERATING_NOISE_PROXIMITY = 350;
const HOMING_NOISE = '/sounds/homing.wav' // homing
const HOMING_VOLUME = 0.05;
const GROWING_NOISE = '/sounds/grow.wav' // growing (louder bigger)
const GROWING_VOLUME = 0.01;
const SPLITTING_NOISE = '/sounds/split.wav' // splitting
const SPLITTING_VOLUME = 0.3;

// declare balance constants
const MIN_SPLIT_SIZE = 30;
const MIN_BOUNCE_SIZE = 30;
const BOUNCE_DECREMENT = 10;
const PROJECTILE_FREQUENCY_INCREMENT = 0.005;
const PROJECTILE_SIZE_INCREMENT = 0.005;
const BASE_PROJECTILE_CHANCE_DECREMENT = 10;

let homingChance = 0.5; // base homing frequency of HomingProjectiles
let accelerationRate = 1; // base acceleration rate of AcceleratingProjectiles
let growSpeed = 30; // base speed of growth for GrowingProjectiles
let gravityStrength = 1000; // base gravitational pull of GravityProjectiles
let splitChance = 3; // base split chance of SplittingProjectiles

let PROJECTILE_POINTS = 1;
let BOUNCY_PROJECTILE_POINTS = 5;
let HOMING_PROJECTILE_POINTS = 10;
let ACCELERATING_PROJECTILE_POINTS = 10;
let GROWING_PROJECTILE_POINTS = 10;
let GRAVITY_PROJECTILE_POINTS = 50;
let SPLITTING_PROJECTILE_POINTS = 10;

// declare game variables
let projectiles = []; // array holding the projectiles, starts empty
let points = 0;
let PauseStart = 0; // used when pausing/unpausing to ensure game resumes where it left off
let held_directions = []; // this array is used to manage which direction the player is moving
let sounds = [];
let newProjectile = 0;
let gameState = "title";
let lastRenderTime = 0;

// declare balance variables
let projectileSize = PLAYER_SIZE * 0.3; // base projectile size
let projectileFrequency = 1;
let baseProjectilePercentChance = 80;


function RestartGame() {
    // reset game variables
    projectiles = []; // array holding the projectiles, starts empty
    points = 0;
    lastRenderTime = Date.now(); // used in the game loop to implement frame independence
    gameState = "game"; // gamestate can be title, game, pause, or over
    held_directions = []; // this array is used to manage which direction the player is moving
    sounds = [];
    projectileSize = PLAYER_SIZE * 0.3; // base projectile size
    player.x = player.y = GAME_DIMENSION/2 - PLAYER_SIZE/2;

    PlaySound(NEW_GAME_NOISE, NEW_GAME_VOLUME);
    window.requestAnimationFrame(main); // resume game
}

function IncreaseDifficulty(deltaTime) {
    projectileFrequency += PROJECTILE_FREQUENCY_INCREMENT * deltaTime;
    projectileSize += PROJECTILE_SIZE_INCREMENT * deltaTime;
}

function SpawnNewProjectile(deltaTime) {
    let PreviousValue = newProjectile;
    newProjectile += deltaTime * projectileFrequency;

    if (Math.floor(newProjectile) - Math.floor(PreviousValue) > 0) {
        let projectileType = randomNumberFromRange(1, 100);

        if (projectileType < baseProjectilePercentChance) {
            projectiles.push(new Projectile(player));
        } else {
            projectileType = randomNumberFromRange(1, 6);
    
            if (projectileType <= 1) {
                projectiles.push(BouncyProjectile(player));
            } else if (projectileType <= 2) {
                projectiles.push(new HomingProjectile(player));
            } else if (projectileType <= 3) {
                projectiles.push(new AcceleratingProjectile(player));
            } else if (projectileType <= 4) {
                projectiles.push(new GrowingProjectile(player));
            } else if (projectileType <= 5) {
                projectiles.push(new GravityProjectile(player));
            } else {
                projectiles.push(new SplittingProjectile(player));
            }
        }
    }
}

function DrawProjectiles() {
    for (let i = 0; i < projectiles.length; i++) { // for each projectile
        projectiles[i].draw(); // draw the projectile
    }
}

function DisplayTitleScreen() {
    ctx.fillstyle = "black" // change fill style to black
    ctx.textAlign = "center" // align text to the center
    
    ctx.font = "60px Futura" // change font to 60px Futura
    ctx.fillText("DODGE GAME", GAME_DIMENSION/2, 100); // print "DODGE GAME" centered in x, 100 in y

    ctx.font = "30px Futura" // change font to 30px Futura
    ctx.fillText("AVOID THE PROJECTILES AS LONG AS POSSIBLE", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50); // print message 50 above center of canvas
    ctx.fillText("USE W/A/S/D TO MOVE", GAME_DIMENSION/2, GAME_DIMENSION/2); // print message to center of canvas
    ctx.fillText("PRESS SPACEBAR TO BEGIN AND PAUSE", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50); // print message 50 below center of canvas
}

function DisplayPoints() {
    ctx.font = "30px Futura"; // change font to 30px Futura
    ctx.fillStyle = "black"; // change fill style to black
    ctx.textAlign = "center"; // change text alignment to center
    ctx.fillText("POINTS: " + points, 875, 975); // display points in bottom right corner
}

function UpdateProjectiles(deltaTime) {
    // for each projectile in the projectiles array 
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update(deltaTime);

        if (projectiles[i].action(deltaTime)) {
            projectiles.splice(i, 1);
        }
    }
}

function PlayAndClearSounds() {
    for (let i = 0; i < sounds.length; i++) {
        sounds[i].play();
    }
    sounds = [];
}

function DisplayPauseMessage() {
    ctx.font = "30px Futura"
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED, SPACEBAR TO RESUME", GAME_DIMENSION/2, GAME_DIMENSION/2);
}

function DisplayGameOverMessage() {
    // display gameover message in 30 point Futura black to the center of the screen
    ctx.font = "30px Futura"; // change font to 30px Futura
    ctx.fillStyle = "black"; // change fill style to black
    ctx.textAlign = "center"; // change text alignment to center
    ctx.fillText("GAME OVER", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50); // print "GAME OVER" 50 above center of canvas
    ctx.fillText("POINTS: " + points, GAME_DIMENSION/2, GAME_DIMENSION/2); // display points in center of canvas
    ctx.fillText("TO START OVER, PRESS SPACEBAR", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50); // display message 50 below center of canvas
}

// input two numnbers, min and max
// return random number between min and max
function randomNumberFromRange(min, max) {
    return (Math.random() * (max - min + 1) + min);
}

function PlaySound(soundLink, volume) {
    let noise = new Audio(soundLink);
    noise.volume = volume;
    sounds.push(noise);
}

class Player {
    constructor() {
        // center player
        this.x = (GAME_DIMENSION / 2) - (PLAYER_SIZE / 2);
        this.y = this.x;

        this.speed = PLAYER_SPEED;
        this.size = PLAYER_SIZE;
    }

    update(deltaTime) { // update the player's location, check for collision with projectiles
        switch (held_directions[0]) // move player according to key(s) held down
        {
            case 'W': // W/w is most recently held key
                this.y -= this.speed * deltaTime; // move player up
                break;
            case 'A': // A/a is most recently held key 
                this.x -= this.speed * deltaTime; // move player left
                break;
            case 'S': // S/s is most recently held key
                this.y += this.speed * deltaTime; // move player down
                break;
            case 'D': // D/d is most recently held key
                this.x += this.speed * deltaTime; // move player right
                break;
        }

        // loop the character around the battlefield
        if (this.x + PLAYER_SIZE < 0) { // if player goes too far left
            this.x = GAME_DIMENSION; // move player to right side of the battlefield
        }
        if (this.x > GAME_DIMENSION) { // if player goes too far right
            this.x = 0 - PLAYER_SIZE; // move player to left side of the battlefield
        }
        if (this.y + PLAYER_SIZE < 0) { // if player goes too far up
            this.y = GAME_DIMENSION; // move player to bottom of the battlefield
        }
        if (this.y > GAME_DIMENSION) { // if player goes too far down
            this.y = 0 - PLAYER_SIZE; // move player to top of the battlefield
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
        this.size = projectileSize * randomNumberFromRange(0.5, 1.5); // randomly assign each projectile a size

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

        this.checkForDeletion = false; // don't check for deletion at first, only start checking once projectile has entered the battlefield
        this.points = PROJECTILE_POINTS; // the number of points associated with this projectile
    }

    update(deltaTime) { // update projectile's location each frame
        this.x += this.dx * deltaTime; // update x coordinate
        this.y += this.dy * deltaTime; // update y coordinate
    }

    action() { // perform all necessary actions, such as removing the projectile if it leaves the battlefield
        if ((this.x + this.size >= player.x && this.x <= player.x + player.size) && (this.y + this.size >= player.y && this.y <= player.y + player.size)) {
            gameState = 'over';
            PlaySound(GAME_OVER_NOISE, GAME_OVER_VOLUME);
        }
        
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.checkForDeletion = true;
        }

        if (this.checkForDeletion) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += this.points;
                return true;
            }
        }
    }

    draw() { // used to draw the projectile to the canvas
        ctx.fillStyle = "red"; // set fill style to red
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile as a red square to canvas
    }
}

class BouncyProjectile extends Projectile { // this projectile derives from Projectile base class, and bounces against the walls instead
                                            // of leaving the battefield and being removed
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.size += 2 * MIN_BOUNCE_SIZE;
        this.points = BOUNCY_PROJECTILE_POINTS; // update points value to be 5, 5 points for each bounce
    }

    action() {
        if ((this.x + this.size >= player.x && this.x <= player.x + player.size) && (this.y + this.size >= player.y && this.y <= player.y + player.size)) {
            gameState = 'over';
            PlaySound(GAME_OVER_NOISE, GAME_OVER_VOLUME);
        }
        
        if (this.x < GAME_DIMENSION - this.size && this.x > 0         // if the projectile has fully entered the battlefield, start checking it
            && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.checkForBounce = true
        }

        if (this.checkForBounce) {     // once the projectile has entered the battlefield, start checking it
            if (this.x < 0 || this.x > GAME_DIMENSION - this.size) { // if projectile contacts left or right wall
                this.dx *= -1; // reverse velocity in x direction, thus 'bouncing' off the wall
                points += this.points; // add 5 points

                PlaySound(BOUNCE_NOISE, BOUNCE_VOLUME);

                if (this.size > MIN_BOUNCE_SIZE) {
                    this.size -= BOUNCE_DECREMENT;
                } else {
                    return true;
                }
            }
            if (this.y < 0 || this.y > GAME_DIMENSION - this.size) { // if projectile contacts top or bottom wall
                this.dy *= -1; // reverse velocity in y direction, thus 'bouncing' off the wall
                points += this.points; // add 5 points
                
                PlaySound(BOUNCE_NOISE, BOUNCE_VOLUME);
                
                if (this.size > MIN_BOUNCE_SIZE) {
                    this.size -= BOUNCE_DECREMENT;
                } else {
                    return true;
                }
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
        this.points = HOMING_PROJECTILE_POINTS; // update points to be 5
    }
    
    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as base action function
        
        if (Math.random() * homingChance > 0.99) {        // randomly decide whether to redirect toward the player
            // this.timeUntilPlayer = randomNumberFromRange(1, 2); // assign new speed
            this.dx = (player.x - this.x) / this.timeUntilPlayer; // assign new velocity in x dimension
            this.dy = (player.y - this.y) / this.timeUntilPlayer; // assign new velocity in y dimension

            PlaySound(HOMING_NOISE, HOMING_VOLUME);
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

        this.points = ACCELERATING_PROJECTILE_POINTS; // update points to be 5
        this.play = true;
        this.proximity = ACCELERATING_NOISE_PROXIMITY;
    }

    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as the parent class action() function

        // accelerate the projectile
        this.dx += (accelerationRate * this.dx * deltaTime); // accelerate in x dimension
        this.dy += (accelerationRate * this.dy * deltaTime); // accelerate in y dimension

        let distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));

        if ((this.play) && (distance < this.proximity)) {
            PlaySound(ACCELERATING_NOISE, ACCLERATING_VOLUME)
            this.play = false;
        }
    }

    draw() { // used to draw the projectile to the canvas
        ctx.fillStyle = "orange";  // update fill style to orange
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as an orange square
    }
}

class GrowingProjectile extends Projectile { // this class derives from base Projectile, and grows as it moves
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.points = GROWING_PROJECTILE_POINTS; // update this.points to be 5
    }

    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as the base class action() function 

        this.size += growSpeed * deltaTime; // grow the projectile

        if (Math.floor(this.size) % 11 == 0) {
            PlaySound(GROWING_NOISE, Math.min(GROWING_VOLUME * this.size, 1));
        }
    }

    draw() {
        ctx.fillStyle = `rgb(0, 142, 5)`; // change fill style to green
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a green square
    }
}

class GravityProjectile extends Projectile { // this class derives from base Projectile, and draws the player closer to it
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.points = GRAVITY_PROJECTILE_POINTS; // update this.points to be 5
    }

    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as the base class action() function 

        let xDistance = player.x - this.x;
        let yDistance = player.y - this.y;
        let Distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        if (xDistance < 0) {
            player.x += this.size * gravityStrength * deltaTime / Distance;
        } else {
            player.x -= this.size * gravityStrength * deltaTime / Distance;
        }

        if (yDistance < 0) {
            player.y += this.size * gravityStrength * deltaTime / Distance;
        } else {
            player.y -= this.size * gravityStrength * deltaTime / Distance;
        }

        PlaySound(GRAVITY_NOISE, GRAVITY_VOLUME);
    }

    draw() {
        ctx.fillStyle = `rgb(77, 0, 255)`; // change fill style to blue
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a blue square
    }
}

class SplittingProjectile extends Projectile { // this class derives from base Projectile, and splits into multiple projectiles
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.size += MIN_SPLIT_SIZE;
        this.points = SPLITTING_PROJECTILE_POINTS; // update this.points to be 5
    }

    action(deltaTime) {
        if (super.action()) return true; // perform all the same actions as the base class action() function 

        if (Math.random() * splitChance > 0.99 && this.size > MIN_SPLIT_SIZE) {
            let angle = Math.atan(this.dy/this.dx);
            if (this.dx < 0) angle += Math.PI; 
            let speedSquared = Math.pow(this.dx, 2) + Math.pow(this.dy, 2);

            let angle1 = angle + Math.PI/12;
            let slope1 = Math.tan(angle1);

            let split1 = new SplittingProjectile(player);
            split1.x = this.x;
            split1.y = this.y;
            split1.size = this.size / 2;
            split1.slope = slope1;
            split1.dx = Math.sqrt(speedSquared / (Math.pow(slope1, 2) + 1));
            if (this.dx < 0) split1.dx *= -1;
            split1.dy = slope1 * split1.dx;
        
            let angle2 = angle - Math.PI/12;
            let slope2 = Math.tan(angle2);

            let split2 = new SplittingProjectile(player);
            split2.x = this.x;
            split2.y = this.y;
            split2.size = this.size / 2;
            split2.slope = slope2;
            split2.dx = Math.sqrt(speedSquared / (Math.pow(slope2, 2) + 1));
            if (this.dx < 0) split2.dx *= -1;
            split2.dy = slope2 * split2.dx;

            PlaySound(SPLITTING_NOISE, SPLITTING_VOLUME);
            projectiles.push(split1, split2);
            return true;
        }
    }

    draw() {
        ctx.fillStyle = `rgb(255, 230, 0)`; // change fill style to yellow
        ctx.fillRect(this.x, this.y, this.size, this.size); // draw the projectile to canvas as a yellow square
    }
}

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
                    RestartGame();
                    window.requestAnimationFrame(main); // start game
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
                    RestartGame();
                    window.requestAnimationFrame(main);
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

// retrieve the canvas and its context, set canvas dimensions
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = GAME_DIMENSION;
canvas.height = GAME_DIMENSION;

let player = new Player(GAME_DIMENSION, PLAYER_SIZE, PLAYER_SPEED);

function main(currentTime) { // main function containing game loop
    switch (gameState) {
        case "title":
            ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);    // at the beginning of each frame, clear the canvas
            // display title screen
            DisplayTitleScreen();
            break;
        case "game": // if the game is playing, perform all necessary actions
            ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);    // at the beginning of each frame, clear the canvas
            //const deltaTime = (currentTime - lastRenderTime) / 1000;  // keep track of how much time has passed, this is to normalize game speed regardless of machine processing speed
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastRenderTime) / 1000;
            lastRenderTime = currentTime;

            // add projectiles, want method involving deltaTime
            // newProjectile variable, add constant * deltaTime each time
            // when newProjectile breaks to new integer, add a projectile
            // come up with random number 1-1000
            // 1-900 base, 901-950 bounce, 951-960 homing, etc.
            // each frame, decrement base by deltaTIme * constant, add same amount
            // to one of the specials at random
            SpawnNewProjectile(deltaTime);

            // lastRenderTime = currentTime;
        
            player.update(deltaTime); // update the player
            
            UpdateProjectiles(deltaTime);
            player.draw(); // draw character
            DrawProjectiles();
            DisplayPoints();

            PlayAndClearSounds();

            window.requestAnimationFrame(main); 
            break;
        case "pause": // if the game is paused, do nothing but display pause message
            DisplayPauseMessage();
            break;
        case "over": // if the game is over, display gameover screen
            DisplayGameOverMessage();
            break;       
    }
}

window.requestAnimationFrame(main);