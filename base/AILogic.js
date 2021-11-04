/* 
/   easyAI is a simple AI with a passive, safe play style
/   it focuses on avoiding hits and attempting a hit of its own only when safe
/
/   hardAI is a more aggressive, much more difficult AI
/   it focuses on circling the player and attempting hits nearly whenever possible
/   there are some random elements compared to the completely algorithmic easyAI
/
/   comment out "AILogic();" in gamePlay.js to "turn-off" AI, towards the end of the draw() function
*/

//utility funciton to generate a number between 0 (inclusive) and max (exclusive)
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//utility function switch the AI's movement to the opposite direction, used for randomness
function reverseDirection() {
    if (opp1.getFacingDirection() == LEFT_DIR) {
        opp1.setFacingDirection(RIGHT_DIR);
    } else if (opp1.getFacingDirection() == RIGHT_DIR) {
        opp1.setFacingDirection(LEFT_DIR);
    } else if (opp1.getFacingDirection() == UP_DIR) {
        opp1.setFacingDirection(DOWN_DIR);
    } else if (opp1.getFacingDirection() == DOWN_DIR) {
        opp1.setFacingDirection(UP_DIR);
    }
}

/* 
/  Move/other action functions for the AI.
*/

/*
/   Purpose: changes the position of the AI
/
/   Param: dir: represents the direction the AI should move in: LEFT_DIR, RIGHT_DIR, UP_DIR, or DOWN_DIR
*/
function AIMove(dir) {
    if (dir == LEFT_DIR) {
        // move left and adjust if outside window border
        if(opp1.getX() - opp1.getDx()  < 0){
            opp1.setX(borderBounce);
        }
        opp1.setX(opp1.getX() - opp1.getDx());

        //check to see if any entities were collided with
        var hitSomething = false;
        for (var i = 0; i < entities.length; i++) {
            if (rectCollisionCheck(opp1, entities[i]) && opp1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
                hitSomething = true;
            }
        }
        if ( hitSomething ) {
            opp1.setX(opp1.getX() + opp1.getDx());
        }
        opp1.setFacingDirection(LEFT_DIR);

        if (hitSomething) {
            AIUnstuck(LEFT_DIR);
            return false;
        }
        return true;
    } else if (dir == RIGHT_DIR) {
        // move right and adjust if outside window border
        if (opp1.getX()+opp1.getDx()  > canvas.width - opp1.getWidth()) {
            opp1.setX(canvas.width - opp1.getWidth() - borderBounce);
        }
        opp1.setX(opp1.getX() + opp1.getDx());

        //check to see if any entities were collided with
        var hitSomething = false;
        for (var i = 0; i < entities.length; i++) {
            if (rectCollisionCheck(opp1, entities[i]) && opp1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
                hitSomething = true;
            }
        }
        if ( hitSomething ) {
            opp1.setX(opp1.getX() - opp1.getDx());
        }
        opp1.setFacingDirection(RIGHT_DIR);

        if (hitSomething) {
            AIUnstuck(RIGHT_DIR);
            return false;
        }
        return true;
    } else if (dir == UP_DIR) {
        // move up and adjust if outside window border
        if(opp1.getY() + opp1.getDy() <  0) {
            opp1.setY(borderBounce);
        }
        opp1.setY(opp1.getY() - opp1.getDy());
    
        //check to see if any entities were collided with
        var hitSomething = false;
        for (var i = 0; i < entities.length; i++) {
            if (rectCollisionCheck(opp1, entities[i]) && opp1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
                hitSomething = true;
            }
        }
        if ( hitSomething ) {
            opp1.setY(opp1.getY() + opp1.getDy());
        }
        opp1.setFacingDirection(UP_DIR);
    
        if (hitSomething) {
            AIUnstuck(UP_DIR);
            return false;
        }
        return true;
    } else if (dir == DOWN_DIR) {
        // move down and adjust if outside window border
        if (opp1.getY() - opp1.getDy() > canvas.height - opp1.getHeight()) {
            opp1.setY(canvas.height - opp1.getHeight() - borderBounce);
        }
        opp1.setY(opp1.getY() + opp1.getDy());

        //check to see if any entities were collided with
        var hitSomething = false;
        for (var i = 0; i < entities.length; i++) {
            if (rectCollisionCheck(opp1, entities[i]) && opp1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
                hitSomething = true;
            }
        }
        if ( hitSomething ) {
            opp1.setY(opp1.getY() - opp1.getDy());
        }
        opp1.setFacingDirection(DOWN_DIR);

        if (hitSomething) {
            AIUnstuck(DOWN_DIR);
            return false;
        }
        return true;
    }
}

/*
/   Purpose: prevent the AI from getting stuck on walls and corners if it's desired move
/            is unsuccessful. Tries to move in all other directions while taking the shortest
/            path to the player.
/   
/   Param:   dir: The direction of the unsuccessful movement
*/
function AIUnstuck(dir) {
    if (dir == LEFT_DIR) { //cant move left
        if (yDist(player1, opp1) < 0) { //take shortest path to player
            if (AIMove(UP_DIR) == true) {
            } else if (AIMove(DOWN_DIR) == true) {
            } else if (AIMove(RIGHT_DIR) == true) {
            }
        } else {
            if (AIMove(DOWN_DIR) == true) {
            } else if (AIMove(UP_DIR) == true) {
            } else if (AIMove(RIGHT_DIR) == true) {
            }
        }
    } 
    else if (dir == RIGHT_DIR) { //cant move right
        if (yDist(player1, opp1) < 0) {
            if (AIMove(UP_DIR) == true) {
            } else if (AIMove(DOWN_DIR) == true) {
            } else if (AIMove(LEFT_DIR) == true) {
            }
        } else {
            if (AIMove(DOWN_DIR) == true) {
            } else if (AIMove(UP_DIR) == true) {
            } else if (AIMove(LEFT_DIR) == true) {
            }
        }
    } 
    else if (dir == UP_DIR) { //cant move up
        if (xDist(player1, opp1) < 0) {
            if (AIMove(LEFT_DIR) == true) {
            } else if (AIMove(RIGHT_DIR) == true) {
            } else if (AIMove(DOWN_DIR) == true) {
            }
        } else {
        if (AIMove(RIGHT_DIR) == true) {
            } else if (AIMove(LEFT_DIR) == true) {
            } else if (AIMove(DOWN_DIR) == true) {
            }
        }
    } 
    else if (dir == DOWN_DIR) { //cant move down
        if (xDist(player1, opp1) < 0) {
            if (AIMove(LEFT_DIR) == true) {
            } else if (AIMove(RIGHT_DIR) == true) {
            } else if (AIMove(UP_DIR) == true) {
            }
        } else {
            if (AIMove(RIGHT_DIR) == true) {
            } else if (AIMove(LEFT_DIR) == true) {
            } else if (AIMove(UP_DIR) == true) {
            }
        }
    } 
}

/*
/  Purpose: Used to determine if two entities share any point on the X axis
/           (i.e. the left edge of ent1 is between the left and right edges of ent2)
/           Not used to determine collision
/ 
/  Params:  ent1: any entity
/           ent2: any entity
/
/  Return:  true if the entities share any points on the X axis
/           false if the entities do not share any points on the X axis
/
*/
function xOverlap(ent1, ent2) {
    var ent1Left = ent1.getX();
    var ent1Right = ent1.getX() + ent1.getWidth();
    var ent2Left = ent2.getX();
    var ent2Right = ent2.getX() + ent2.getWidth();
    return (ent1Left <= ent2Right && ent1Left >= ent2Left) ||
        (ent1Right <= ent2Right && ent1Right >= ent2Left)
}

/*
/  Purpose: Used to determine if two entities share any point on the Y axis
/           (i.e. the top of ent1 is between the top and bottom of ent2)
/           Not used to determine collision
/ 
/  Params:  ent1: any entity
/           ent2: any entity
/
/  Return:  true if the entities share any points on the Y axis
/           false if the entities do not share any points on the Y axis
/
*/
function yOverlap(ent1, ent2) {
    var ent1Top = ent1.getY();
    var ent1Bot = ent1.getY() + ent1.getHeight();
    var ent2Top = ent2.getY();
    var ent2Bot = ent2.getY() + ent2.getHeight();
    return (ent1Top <= ent2Bot && ent1Top >= ent2Top) ||
        (ent1Bot <= ent2Bot && ent1Bot >= ent2Top)
}

/*
/  Purpose: calculate the distance between two entities on the X axis
/ 
/  Params:  ent1: any entity
/           ent2: any entity
/
/  Return:  distance between the entities on the X axis
/
*/
function xDist(ent1, ent2) {
    return ent1.getX() - ent2.getX();
}

/*
/  Purpose: calculate the distance between two entities on the Y axis
/ 
/  Params:  ent1: any entity
/           ent2: any entity
/
/  Return:  distance between the entities on the Y axis
/
*/
function yDist(ent1, ent2) {
    return ent1.getY() - ent2.getY();
}

/*
/  Purpose: Move the AI towards the player horizontally (in the X axis)
*/
function horizontalMovement() {
    if (xDist(player1, opp1) >= bumpDistance * 1.75) {
        AIMove(RIGHT_DIR);
    } else if (xDist(player1, opp1) <= -bumpDistance * 1.75) {
        AIMove(LEFT_DIR);
    }
}

/*
/  Purpose: Move the AI towards the player vertically (in the Y axis)
*/
function verticalMovement() {
    if (yDist(player1, opp1) >= bumpDistance * 1.75) {
        AIMove(DOWN_DIR);
    } else if (yDist(player1, opp1) <= -bumpDistance * 1.75) {
        AIMove(UP_DIR);
    }
}

/*
/  Purpose: Move the AI away from the player horizontally (in the X axis)
*/
function horizontalMovementAway() {
    if (xDist(player1, opp1) <= bumpDistance * 1.75 && xDist(player1, opp1) > 0) {
        AIMove(LEFT_DIR);
    } else if (xDist(player1, opp1) >= -bumpDistance * 1.75 && xDist(player1, opp1) < 0) {
        AIMove(RIGHT_DIR);
    }
}

/*
/  Purpose: Move the AI away from the player vertically (in the Y axis)
*/
function verticalMovementAway() {
    if (yDist(player1, opp1) <= bumpDistance * 1.75 && yDist(player1, opp1) > 0) {
        AIMove(UP_DIR);
    } else if (yDist(player1, opp1) >= -bumpDistance * 1.75 && yDist(player1, opp1) < 0) {
        AIMove(DOWN_DIR);
    }
}

/*
/   Purpose: call easyAI() or hardAI() depending on the difficulty chosen at the start of the game
*/
function AILogic() {
    if (AI_DIFFICULTY == 0) {
        easyAI();
    } else if (AI_DIFFICULTY == 1) {
        hardAI();
    }
}

function easyAI() {
    //if far from player1, move closer
    if ((Math.abs(xDist(player1, opp1)) >= bumpDistance * 1.75 || Math.abs(yDist(player1, opp1)) >= bumpDistance * 1.75) && player1.getActionState() != BUMPING_STATE) {
        
        //can and will move horizontally and vertically at the same time, just like a player could
        //prioritize reducing the greatest distance first
        if (Math.abs(xDist(player1, opp1)) > Math.abs(yDist(player1, opp1))) {
            horizontalMovement();
            verticalMovement();
        } else {
            verticalMovement();
            horizontalMovement();
        }   
    } else if (player1.getActionState() == BUMPING_STATE) { //will avoid bumps from players, prioritize moving directly away from an attack
        if (player1.getFacingDirection() == LEFT_DIR) {
            AIMove(LEFT_DIR);
        } else if (player1.getFacingDirection() == RIGHT_DIR) {
            AIMove(RIGHT_DIR);
        } else if (player1.getFacingDirection() == UP_DIR) {
            AIMove(UP_DIR);
        }else if (player1.getFacingDirection() == DOWN_DIR) {
            AIMove(DOWN_DIR);
        }
    }

    //attempt to bump player1 if able and player1 bump is on cooldown
    if (opp1.getActionCooldown() == 0 && player1.getActionCooldown() != 0) {
        if (xDist(player1, opp1) <= bumpDistance * 1.75 && xDist(player1, opp1) >= 0 && yOverlap(opp1, player1)) {
            opp1.setFacingDirection(RIGHT_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } else if (xDist(player1, opp1) >= -bumpDistance * 1.75 && xDist(player1, opp1) <= 0 && yOverlap(opp1, player1)) {
            opp1.setFacingDirection(LEFT_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } else if (yDist(player1, opp1) <= bumpDistance * 1.75 && yDist(player1, opp1) >= 0 && xOverlap(opp1, player1)) {
            opp1.setFacingDirection(DOWN_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } else if (yDist(player1, opp1) >= -bumpDistance * 1.75 && yDist(player1, opp1) <= 0 && xOverlap(opp1, player1)) {
            opp1.setFacingDirection(UP_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } 
    }
}

function hardAI() {
    var bumped = false; //probably a redundant variable, but might as well test it
    if (opp1.getActionState() == NORMAL_STATE) {
        if (Math.abs(xDist(player1, opp1)) > Math.abs(yDist(player1, opp1)) && player1.getActionState() != BUMPING_STATE) {
            if (Math.abs(xDist(player1, opp1)) > bumpDistance * 1.75) {
                horizontalMovement();
            } else if (Math.abs(xDist(player1, opp1)) < bumpDistance * 1.5 && yOverlap(player1, opp1)) {
                horizontalMovementAway();
            } else {
                if (((opp1.getFacingDirection() == LEFT_DIR || opp1.getFacingDirection() == RIGHT_DIR) && yOverlap(player1, opp1) == false) ||
                    ((opp1.getFacingDirection() == UP_DIR || opp1.getFacingDirection() == DOWN_DIR) && xOverlap(player1, opp1) == false)) {
                    if (getRandomInt(70) == 0) {
                        reverseDirection();
                    }
                    AIMove(opp1.getFacingDirection());
                } else if (yOverlap(player1, opp1) == true) {
                    if (yDist(player1, opp1) < 0) {
                        AIMove(UP_DIR);
                    } else {
                        AIMove(DOWN_DIR);
                    }
                }
            }

            if (Math.abs(yDist(player1, opp1)) > bumpDistance * 1.75) {
                verticalMovement();
            } else if (Math.abs(yDist(player1, opp1)) < bumpDistance * 1.5 && xOverlap(player1, opp1)) {
                verticalMovementAway();
            } else {
                
            }
        } else if (Math.abs(xDist(player1, opp1)) < Math.abs(yDist(player1, opp1)) && player1.getActionState() != BUMPING_STATE) {
            if (Math.abs(yDist(player1, opp1)) > bumpDistance * 1.75) {
                verticalMovement();
            } else if (Math.abs(yDist(player1, opp1)) < bumpDistance * 1.5 && xOverlap(player1, opp1)) {
                verticalMovementAway();
            } else {
                if (((opp1.getFacingDirection() == UP_DIR || opp1.getFacingDirection() == DOWN_DIR) && xOverlap(player1, opp1) == false) ||
                    ((opp1.getFacingDirection() == LEFT_DIR || opp1.getFacingDirection() == RIGHT_DIR) && yOverlap(player1, opp1) == false)) {
                    if (getRandomInt(70) == 0) {
                        reverseDirection();
                    }
                    AIMove(opp1.getFacingDirection());
                } else if (xOverlap(player1, opp1) == true) {
                    if (xDist(player1, opp1) < 0) {
                        AIMove(LEFT_DIR);
                    } else {
                        AIMove(RIGHT_DIR);
                    }
                }
            }

            if (Math.abs(xDist(player1, opp1)) > bumpDistance * 1.75) {
                horizontalMovement();
            } else if (Math.abs(xDist(player1, opp1)) < bumpDistance * 1.5 && yOverlap(player1, opp1)) {
                horizontalMovementAway();
            } else {

            }
        } else {
            if (opp1.getFacingDirection() == LEFT_DIR) {
                if (yDist(player1, opp1) < 0) {
                    AIMove(UP_DIR);
                } else {
                    AIMove(DOWN_DIR);
                }
            } else if (opp1.getFacingDirection() == RIGHT_DIR) {
                if (yDist(player1, opp1) < 0) {
                    AIMove(UP_DIR);
                } else {
                    AIMove(DOWN_DIR);
                }
            } else if (opp1.getFacingDirection() == UP_DIR) {
                if (xDist(player1, opp1) < 0) {
                    AIMove(LEFT_DIR);
                } else {
                    AIMove(RIGHT_DIR);
                }
            } else if (opp1.getFacingDirection() == DOWN_DIR) {
                if (xDist(player1, opp1) < 0) {
                    AIMove(LEFT_DIR);
                } else {
                    AIMove(RIGHT_DIR);
                }
            }
        }
    } else if (opp1.getActionState() == BUMPING_STATE) {
        bumped = true;
        entityBump(opp1);
    }

    //attempt to bump player1 if able and player1 bump is on cooldown
    /*
    /   KNOWN BUG:  a single bump can hit the player multiple times and do more damage than intended
    /               I believe this is due to the player's actionState being able to change from HIT_STATE
    /               before the bump is finished. through keyboard inputs, the player's actionState is changed
    /               from HIT_STATE to something else (BUMPING_STATE) before the bump has finished and while still colliding with
    /               the AI causing multiple hits.
    */
    if ((opp1.getActionCooldown() == 0) && opp1.getActionState() != BUMPING_STATE && bumped == false && getRandomInt(65) < 2) { //randomness is to balance out the bug for now. will need to actually fix
        if (xDist(player1, opp1) <= bumpDistance * 1.75 && xDist(player1, opp1) >= 0 && yOverlap(opp1, player1)) {
            opp1.setFacingDirection(RIGHT_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } else if (xDist(player1, opp1) >= -bumpDistance * 1.75 && xDist(player1, opp1) <= 0 && yOverlap(opp1, player1)) {
            opp1.setFacingDirection(LEFT_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } else if (yDist(player1, opp1) <= bumpDistance * 1.75 && yDist(player1, opp1) >= 0 && xOverlap(opp1, player1)) {
            opp1.setFacingDirection(DOWN_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } else if (yDist(player1, opp1) >= -bumpDistance * 1.75 && yDist(player1, opp1) <= 0 && xOverlap(opp1, player1)) {
            opp1.setFacingDirection(UP_DIR);
            opp1.setActionState(BUMPING_STATE);
            entityBump(opp1);
        } 
    }
}