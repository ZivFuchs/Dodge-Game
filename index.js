// declare dimensional constants
const GAME_DIMENSION = 1000;
const PLAYER_SIZE = GAME_DIMENSION * 0.05;
const PLAYER_SPEED = PLAYER_SIZE * 15;

// declare sound constants
const NEW_GAME_NOISE = '/sounds/new game.wav';
const NEW_GAME_VOLUME = 0.05;
const GAME_OVER_NOISE = '/sounds/gameOver.wav';
const GAME_OVER_VOLUME = 0.05;
const BOUNCE_NOISE = '/sounds/Bounce.wav'; // sound credit to https://www.youtube.com/watch?v=hwn3Ox67yHQ
const BOUNCE_VOLUME = 0.3;
const GRAVITY_NOISE = '/sounds/gravity4.wav';
const GRAVITY_VOLUME = 0.1;
const ACCELERATING_NOISE = '/sounds/accelerate.wav';
const ACCLERATING_VOLUME = 0.4;
const ACCELERATING_NOISE_PROXIMITY = 350;
const HOMING_NOISE = '/sounds/homing.wav';
const HOMING_VOLUME = 0.05;
const GROWING_NOISE = '/sounds/grow.wav';
const GROWING_VOLUME = 0.01;
const GROWING_FREQUENCY = 11;
const SPLITTING_NOISE = '/sounds/split.wav';
const SPLITTING_VOLUME = 0.3;

// declare balance constants
const MIN_SPLIT_SIZE = 15;
const MIN_BOUNCE_SIZE = 30;
const BOUNCE_DECREMENT = 10;
const PROJECTILE_FREQUENCY_INCREMENT = 0.5;
const PROJECTILE_SIZE_INCREMENT = 0.5;
const BASE_PROJECTILE_CHANCE_DECREMENT = 50;

let homingChance = 1;
let accelerationRate = 1;
let growSpeed = 30;
let gravityStrength = 1500;
let splitChance = 1;

let PROJECTILE_POINTS = 1;
let BOUNCY_PROJECTILE_POINTS = 5;
let HOMING_PROJECTILE_POINTS = 10;
let ACCELERATING_PROJECTILE_POINTS = 10;
let GROWING_PROJECTILE_POINTS = 10;
let GRAVITY_PROJECTILE_POINTS = 50;
let SPLITTING_PROJECTILE_POINTS = 10;

// declare game variables
let projectiles = [];
let points = 0;
let PauseStart = 0; // used when pausing/unpausing to ensure game resumes where it left off
let held_directions = []; // this array is used to manage which direction the player is moving
let sounds = [];
let newProjectile = 0;
let gameState = "title"; // can be title, game, pause, or over
let lastRenderTime = 0;

// declare balance variables
let projectileSize = PLAYER_SIZE * 0.3;
let projectileFrequency = 1;
let baseProjectilePercentChance = 85;


function RestartGame() {
    // reset game variables
    projectiles = [];
    points = 0;
    lastRenderTime = Date.now(); // used in the game loop to implement frame independence
    gameState = "game";
    held_directions = [];
    sounds = [];
    projectileSize = PLAYER_SIZE * 0.3;
    player.x = player.y = GAME_DIMENSION/2 - PLAYER_SIZE/2;

    PlaySound(NEW_GAME_NOISE, NEW_GAME_VOLUME);
    window.requestAnimationFrame(main); // resume game
}

function IncreaseDifficulty(deltaTime) {
    projectileFrequency += PROJECTILE_FREQUENCY_INCREMENT * deltaTime;
    projectileSize += PROJECTILE_SIZE_INCREMENT * deltaTime;
    baseProjectilePercentChance -= BASE_PROJECTILE_CHANCE_DECREMENT * deltaTime;
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
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].draw();
    }
}

function DisplayTitleScreen() {
    ctx.fillstyle = "black";
    ctx.textAlign = "center";
    
    ctx.font = "60px Futura"
    ctx.fillText("DODGE GAME", GAME_DIMENSION/2, 100);

    ctx.font = "30px Futura";
    ctx.fillText("AVOID THE PROJECTILES AS LONG AS POSSIBLE", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50);
    ctx.fillText("USE W/A/S/D TO MOVE", GAME_DIMENSION/2, GAME_DIMENSION/2);
    ctx.fillText("PRESS SPACEBAR TO BEGIN AND PAUSE", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50);
}

function DisplayPoints() {
    ctx.font = "30px Futura";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("POINTS: " + points, 875, 975);
}

function UpdateProjectiles(deltaTime) {
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
    ctx.font = "30px Futura";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED, SPACEBAR TO RESUME", GAME_DIMENSION/2, GAME_DIMENSION/2);
}

function DisplayGameOverMessage() {
    ctx.font = "30px Futura";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", GAME_DIMENSION/2, GAME_DIMENSION/2 - 50);
    ctx.fillText("POINTS: " + points, GAME_DIMENSION/2, GAME_DIMENSION/2);
    ctx.fillText("TO START OVER, PRESS SPACEBAR", GAME_DIMENSION/2, GAME_DIMENSION/2 + 50);
}

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
        ctx.fillStyle = "black";
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }
}

class Projectile {
    constructor(player) {
        this.size = projectileSize * randomNumberFromRange(0.5, 1.5);

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
        this.timeUntilPlayer = randomNumberFromRange(1, 2);
        this.dx = (player.x - this.x) / this.timeUntilPlayer;
        this.dy = (player.y - this.y) / this.timeUntilPlayer;

        this.checkForDeletion = false; // don't check for deletion at first, only start checking once projectile has entered the battlefield
        this.points = PROJECTILE_POINTS;
    }

    update(deltaTime) { // update projectile's location each frame
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
    }

    action() { // perform all necessary actions, such as removing the projectile if it leaves the battlefield
        let collision = (this.x + this.size >= player.x && this.x <= player.x + player.size) && (this.y + this.size >= player.y && this.y <= player.y + player.size)

        if (collision) {
            gameState = 'over';
            PlaySound(GAME_OVER_NOISE, GAME_OVER_VOLUME);
        }
        
        let exitedScreen = this.x < GAME_DIMENSION - this.size && this.x > 0 && this.y < GAME_DIMENSION - this.size && this.y > 0;
        if (exitedScreen) {
            this.checkForDeletion = true;
        }

        if (this.checkForDeletion) {
            if (this.x > GAME_DIMENSION || this.x + this.size < 0 || this.y > GAME_DIMENSION || this.y + this.size < 0) {
                points += this.points;
                return true;
            }
        }
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class BouncyProjectile extends Projectile { // this projectile derives from Projectile base class, and bounces against the walls instead
                                            // of leaving the battefield and being removed
    constructor(player) {
        super(player); // perform all the same actions as base class constructor
        this.size += 2 * MIN_BOUNCE_SIZE;
        this.points = BOUNCY_PROJECTILE_POINTS;
    }

    action() {
        if ((this.x + this.size >= player.x && this.x <= player.x + player.size) && (this.y + this.size >= player.y && this.y <= player.y + player.size)) {
            gameState = 'over';
            PlaySound(GAME_OVER_NOISE, GAME_OVER_VOLUME);
        }
        
        if (this.x < GAME_DIMENSION - this.size && this.x > 0 // if the projectile has fully entered the battlefield, start checking it for bounces
            && this.y < GAME_DIMENSION - this.size && this.y > 0) {
            this.checkForBounce = true;
        }

        if (this.checkForBounce) { 
            if (this.x < 0 || this.x > GAME_DIMENSION - this.size) { // if projectile contacts left or right wall
                this.dx *= -1; // reverse velocity in x direction
                points += this.points;

                PlaySound(BOUNCE_NOISE, BOUNCE_VOLUME);

                if (this.size > MIN_BOUNCE_SIZE) {
                    this.size -= BOUNCE_DECREMENT;
                } else {
                    return true; // return true, removing the projectile
                }
            }
            if (this.y < 0 || this.y > GAME_DIMENSION - this.size) { // if projectile contacts top or bottom wall
                this.dy *= -1; // reverse velocity in y direction
                points += this.points;
                
                PlaySound(BOUNCE_NOISE, BOUNCE_VOLUME);
                
                if (this.size > MIN_BOUNCE_SIZE) {
                    this.size -= BOUNCE_DECREMENT;
                } else {
                    return true;
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = `rgb(252, 125, 255)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class HomingProjectile extends Projectile { // this projectile derives from Projectile base class, and homes onto the player periodically
    constructor(player) {
        super(player);
        this.points = HOMING_PROJECTILE_POINTS;
    }
    
    action(deltaTime) {
        if (super.action()) return true;
        
        if (Math.random() * homingChance > 0.99) {        // randomly decide whether to redirect toward the player
            this.timeUntilPlayer = randomNumberFromRange(1, 2);
            this.dx = (player.x - this.x) / this.timeUntilPlayer;
            this.dy = (player.y - this.y) / this.timeUntilPlayer;

            PlaySound(HOMING_NOISE, HOMING_VOLUME);
        }
    }

    draw() {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class AcceleratingProjectile extends Projectile { // this class derives from Projectile base class, and accelerates as it moves
    constructor(player) {
        super(player);

        this.points = ACCELERATING_PROJECTILE_POINTS;
        this.play = true;
        this.proximity = ACCELERATING_NOISE_PROXIMITY;
    }

    action(deltaTime) {
        if (super.action()) return true;

        // accelerate the projectile
        this.dx += (accelerationRate * this.dx * deltaTime);
        this.dy += (accelerationRate * this.dy * deltaTime);

        let distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));

        if ((this.play) && (distance < this.proximity)) { // the first frame the projectile is within range of the player, play sound effect
            PlaySound(ACCELERATING_NOISE, ACCLERATING_VOLUME)
            this.play = false;
        }
    }

    draw() {
        ctx.fillStyle = "orange";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class GrowingProjectile extends Projectile { // this class derives from base Projectile, and grows as it moves
    constructor(player) {
        super(player);
        this.points = GROWING_PROJECTILE_POINTS;
    }

    action(deltaTime) {
        if (super.action()) return true;

        this.size += growSpeed * deltaTime;

        if (Math.floor(this.size) % GROWING_FREQUENCY == 0) { // play the growing sound effect periodically
            PlaySound(GROWING_NOISE, Math.min(GROWING_VOLUME * this.size, 1));
        }
    }

    draw() {
        ctx.fillStyle = `rgb(0, 142, 5)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class GravityProjectile extends Projectile { // this class derives from base Projectile and has a gravitational pull
    constructor(player) {
        super(player);
        this.points = GRAVITY_PROJECTILE_POINTS;
    }

    action(deltaTime) {
        if (super.action()) return true;

        let xDistance = player.x - this.x;
        let yDistance = player.y - this.y;
        let Distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        // pull the player in according to their distance and the projectile's size
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
        ctx.fillStyle = `rgb(77, 0, 255)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class SplittingProjectile extends Projectile { // this class derives from base Projectile, and splits into multiple projectiles
    constructor(player) {
        super(player);
        this.size += 2 * MIN_SPLIT_SIZE;
        this.points = SPLITTING_PROJECTILE_POINTS;
    }

    action(deltaTime) {
        if (super.action()) return true;

        if (Math.random() * splitChance > 0.99 && this.size > MIN_SPLIT_SIZE) { // if the projectile is large enough, randomly split
            let angle = Math.atan(this.dy/this.dx);
            if (this.dx < 0) angle += Math.PI; 
            let speedSquared = Math.pow(this.dx, 2) + Math.pow(this.dy, 2);

            let angle1 = angle + Math.PI/24;
            let slope1 = Math.tan(angle1);

            let split1 = new SplittingProjectile(player);
            split1.x = this.x;
            split1.y = this.y;
            split1.size = this.size / 2;
            split1.slope = slope1;
            split1.dx = Math.sqrt(speedSquared / (Math.pow(slope1, 2) + 1));
            if (this.dx < 0) split1.dx *= -1;
            split1.dy = slope1 * split1.dx;
        
            let angle2 = angle - Math.PI/24;
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
        ctx.fillStyle = `rgb(255, 230, 0)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// eventListener for controlling the player, pausing/unpausing/restarting game
document.addEventListener('keydown', (e) => {
    switch(e.code) // once a key is pressed
    {
        case 'KeyW': // if the code of the key pressed is W
            if (held_directions.indexOf('W') === -1) { // if W is not yet in held_directions, add it. Without this clause, the controls are 'sticky,' player keeps moving after all buttons released.
                held_directions.unshift('W'); // add 'W' to beginning of held_directions
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
        case 'Space':
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
        case 'KeyW': // when W is released, remove it from held_directions
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

// retrieve the canvas and its context, set canvas dimensions
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = GAME_DIMENSION;
canvas.height = GAME_DIMENSION;

let player = new Player(GAME_DIMENSION, PLAYER_SIZE, PLAYER_SPEED);

function main(currentTime) {
    switch (gameState) {
        case "title":
            ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);
            DisplayTitleScreen();
            break;
        case "game":
            ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION);    // at the beginning of each frame, clear the canvas
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastRenderTime) / 1000; // keep track of time passed since last frame to ensure frame independence
            lastRenderTime = currentTime;

            SpawnNewProjectile(deltaTime);
        
            player.update(deltaTime);
            
            UpdateProjectiles(deltaTime);
            player.draw();
            DrawProjectiles();
            DisplayPoints();

            PlayAndClearSounds();

            window.requestAnimationFrame(main); 
            break;
        case "pause":
            DisplayPauseMessage();
            break;
        case "over":
            DisplayGameOverMessage();
            break;       
    }
}

window.requestAnimationFrame(main);