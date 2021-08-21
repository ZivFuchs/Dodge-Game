const framesPerSecond = 30

// defines game and player dimensions, both squares
let GAME_DIMENSION = 750
let PLAYER_DIMENSION = 25

// player x and y coordinates, speed
let pX = (GAME_DIMENSION / 2) - (PLAYER_DIMENSION / 2)
let pY = pX
let pSpeed = 10

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")
canvas.width = GAME_DIMENSION
canvas.height = GAME_DIMENSION

// this array is used to manage which direction the player is moving
let held_directions = []

document.addEventListener('keydown', (e) => {
    switch(e.code)
    {
        case 'KeyW':
            if (held_directions.indexOf('W') === -1) {
                held_directions.unshift('W'); 
                character.direction = 'forward';
            }
            break;
        case 'KeyA':
            if (held_directions.indexOf('A') === -1) {
                held_directions.unshift('A');
                character.direction = 'left';
            }
            break;
        case 'KeyS':
            if (held_directions.indexOf('S') === -1) {
                held_directions.unshift('S');
                character.direction = 'back';
            }
            break;
        case 'KeyD':
            if (held_directions.indexOf('D') === -1) {
                held_directions.unshift('D');
                character.direction = 'right';
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

    if (held_directions.length === 0) character.direction = 'neutral';
});

// need to set up game loop, controls, looping around the map

// game loop

    // initiaLize
    // update
        // draw
            // clear canvas
            // draw character
            // draw projectiles

let lastRenderTime = 0
let gameOver = false

function main(currentTime) {
    
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    
    if (secondsSinceLastRender < 1 / framesPerSecond) return;
    lastRenderTime = currentTime;

    switch (held_directions[0])
    {
        case 'W':
            pY -= pSpeed;
            break;
        case 'A':
            pX -= pSpeed;
            break;
        case 'S':
            pY += pSpeed;
            break;
        case 'D':
            pX += pSpeed;
            break;
    }


    if (pX + PLAYER_DIMENSION < 0) pX = GAME_DIMENSION
    if (pX > GAME_DIMENSION )pX = 0 - PLAYER_DIMENSION
    if (pY + PLAYER_DIMENSION < 0) pY = GAME_DIMENSION
    if (pY > GAME_DIMENSION) pY = 0 - PLAYER_DIMENSION

        // draw
            // clear canvas
        ctx.clearRect(0, 0, GAME_DIMENSION, GAME_DIMENSION)
            // draw character
        ctx.fillRect(pX, pY, PLAYER_DIMENSION, PLAYER_DIMENSION)
}

window.requestAnimationFrame(main);
