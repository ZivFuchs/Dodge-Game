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


// ctx.fillRect(pX, pY, PLAYER_DIMENSION, PLAYER_DIMENSION)

// need to set up game loop, controls, looping around the map

// game loop

    // initiaLize
    // update
        // draw
            // clear canvas
            // draw character
            // draw projectiles

