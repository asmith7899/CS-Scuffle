/* 
/   A simple AI with a passive, safe play style
/   focuses on avoiding hits and attempting a hit of its own only when safe
/   comment out "AILogic();" in gamePlay.js to "turn-off" AI, towards the end of the draw() function
*/

//begin AI functions

/* 
/  Move/other action functions for the AI.
*/

//move the AI left
//return true if move is successful
//return false if collision happens
function AIMoveLeft() {

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
        return false;
    }
    return true;
}

//move the AI right
//return true if move is successful
//return false if collision happens
function AIMoveRight() {

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
        return false;
    }
    return true;
}

//move the AI up
//return true if move is successful
//return false if collision happens
function AIMoveUp() {
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
        return false;
    }
    return true;
}

//move the AI down
//return true if move is successful
//return false if collision happens
function AIMoveDown() {
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
        return false;
    }
    return true;
}

/*
/   Purpose: prevent the AI from getting stuck on walls and corners if it's desired move
/            is unsuccessful. Tries to move in all other directions while taking the shortest
/            path to the player.
/   
/   Param:   dir: The direction of the unsuccessful movement
*/
function AIUnstuck(dir) {
    if (dir == "left") { //cant move left
        if (yDist(player1, opp1) < 0) { //take shortest path to player
            if (AIMoveUp() == true) {
            } else if (AIMoveDown() == true) {
            } else if (AIMoveRight() == true) {
            }
        } else {
            if (AIMoveDown() == true) {
            } else if (AIMoveUp() == true) {
            } else if (AIMoveRight() == true) {
            }
        }
    } 
    else if (dir == "right") { //cant move right
        if (yDist(player1, opp1) < 0) {
            if (AIMoveUp() == true) {
            } else if (AIMoveDown() == true) {
            } else if (AIMoveLeft() == true) {
            }
        } else {
            if (AIMoveDown() == true) {
            } else if (AIMoveUp() == true) {
            } else if (AIMoveLeft() == true) {
            }
        }
    } 
    else if (dir == "up") { //cant move up
        if (xDist(player1, opp1) < 0) {
            if (AIMoveLeft() == true) {
            } else if (AIMoveRight() == true) {
            } else if (AIMoveDown() == true) {
            }
        } else {
        if (AIMoveRight() == true) {
            } else if (AIMoveLeft() == true) {
            } else if (AIMoveDown() == true) {
            }
        }
    } 
    else if (dir == "down") { //cant move down
        if (xDist(player1, opp1) < 0) {
            if (AIMoveLeft() == true) {
            } else if (AIMoveRight() == true) {
            } else if (AIMoveUp() == true) {
            }
        } else {
            if (AIMoveRight() == true) {
            } else if (AIMoveLeft() == true) {
            } else if (AIMoveUp() == true) {
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
        if (AIMoveRight() == false) {
            AIUnstuck("right");
        }
    } else if (xDist(player1, opp1) <= -bumpDistance * 1.75) {
        if (AIMoveLeft() == false) {
            AIUnstuck("left");
        }
    }
}

/*
/  Purpose: Move the AI towards the player vertically (in the Y axis)
*/
function verticalMovement() {
    if (yDist(player1, opp1) >= bumpDistance * 1.75) {
        if (AIMoveDown() == false) {
            AIUnstuck("down");
        }
    } else if (yDist(player1, opp1) <= -bumpDistance * 1.75) {
        if (AIMoveUp() == false) {
            AIUnstuck("up");
        }
    }
}


/*
/   Purpose:  Handles decisions for the AI. Determines how the AI moves, when it bumps, avoids bumps from players
*/
function AILogic() {
    
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
            if (AIMoveLeft() == false) {
                AIUnstuck("left");
            }
        } else if (player1.getFacingDirection() == RIGHT_DIR) {
            if (AIMoveRight() == false) {
                AIUnstuck("right");
            }
        } else if (player1.getFacingDirection() == UP_DIR) {
            if (AIMoveUp() == false) {
                AIUnstuck("up");
            }
        }else if (player1.getFacingDirection() == DOWN_DIR) {
            if (AIMoveDown() == false) {
                AIUnstuck("down");
            }
        }
    }

    //attempt to bump player1 if able and player1 bump is on cooldown
    if (opp1.getActionCooldown() == 0 && player1.getActionCooldown() != 0) {
        if (xDist(player1, opp1) <= bumpDistance * 1.75 && xDist(player1, opp1) >= 0 && yOverlap(opp1, player1)) {
            opp1.setFacingDirection(RIGHT_DIR);
            entityBump(opp1);
        } else if (xDist(player1, opp1) >= -bumpDistance * 1.75 && xDist(player1, opp1) <= 0 && yOverlap(opp1, player1)) {
            opp1.setFacingDirection(LEFT_DIR);
            entityBump(opp1);
        } else if (yDist(player1, opp1) <= bumpDistance * 1.75 && yDist(player1, opp1) >= 0 && xOverlap(opp1, player1)) {
            opp1.setFacingDirection(DOWN_DIR);
            entityBump(opp1);
        } else if (yDist(player1, opp1) >= -bumpDistance * 1.75 && yDist(player1, opp1) <= 0 && xOverlap(opp1, player1)) {
            opp1.setFacingDirection(UP_DIR);
            entityBump(opp1);
        } 
    }
}