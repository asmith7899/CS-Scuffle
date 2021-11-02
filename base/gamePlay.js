/*
/   Notes on useful debug features/gameplay elements currently implemented:
/       -arrow keys to move Player1
/       -e key for Player1 to perform bump actions
/             Note: a bump action is performed in the direction the entity was last facing when the key is pressed
/       -f key for Player1 to pickup the html element behind them. If they are holding a html element
/       -l key to bring up debug overlay*
/       -h key to hide entities (useful if you want to see what's behind them)*
/       -n key to hide the html elements.*
/       -v key to decrease current stamina for player1 and opp1 by 10 points*
/       -z key to increase current stamina for player1 and opp1 by 10 points*
/       -t key to increase time by 3000 seconds*
/       -Destructible objects can be moved over without collision, non-destructible objects have collision
/             Note: during a bump action the entity will collide and be stopped by any Destructible objects
/                   Also, destructible objects are entities that have a TRUE destructibleObject flag.
/
/       -Changing Arenas: Change the Offset constance and arenaElementsIds array to match the map you are wanting to load.
/           Offset Constants: CANVAS_OFFSET, MOVE_OFFSET_X, MOVE_OFFSET_Y
/
/       *debug feature that will be disabled or removed for final version.
*/
//Constants
var NORMAL_STATE = "normal";
var BUMPING_STATE = "bumping";
var PICKUP_STATE = "pickup";
var HIT_STATE = "hit";
var DROP_STATE = "dropping";            //Used for characters and AI
var FALLING_STATE = "falling";          //Used for destructible entities after they are dropped
var HIT_COOLDOWN = 15;                  //amount of immune to damage time after being hit
var KNOCKBACK_COOLDOWN = 10;
var ACTION_COOLDOWN = 15;               //number of frames between actions (time delay between actions)
var UP_DIR = "up";
var DOWN_DIR = "down";
var RIGHT_DIR = "right";
var LEFT_DIR = "left";
var FIRST_ARENA = "first arena page";
var SECOND_ARENA = "second arena page";
var MAX_STAMINA = 100;                  //max stamina for players or AI
var DESTRUCTIBLE_MAX_STAMINA = 30;      //max stamina for destructible objects
var BUMP_DAMAGE = 10;                   //stamina damage delt with any successful bumpaction
var BUMP_KNOCKBACK = 10;

// initialize canvas
var canvas = document.getElementById("myCanvas");
var arena = FIRST_ARENA;
if (canvas == null) {
  arena = SECOND_ARENA;
  canvas = document.getElementById("myCanvas3");
}
var ctx = canvas.getContext("2d"); // we use this 2d rendering context to actually paint on the canvas

//The amount of offset the canvas has to the webpage. Defined in the arena css file
var CANVAS_OFFSET = 0;                  //Use for test-arena
var MOVE_OFFSET_X = 0;
var MOVE_OFFSET_Y = 0;
if (arena == FIRST_ARENA){
  CANVAS_OFFSET = 40;                 //Use for map-arena
  MOVE_OFFSET_X = 16;
  MOVE_OFFSET_Y = 210;
}


//Sound Effects
var shater = new Audio("../SoundEffects/Glass-Shatering.mp3");  //Sound of Destructible Entities breaking
var bumpMovement = new Audio("../SoundEffects/bumpMovement.wav"); //Sound of moving during a bumpaction
var playerHit = new Audio("../SoundEffects/playerHit.wav"); //sound of a player being hit by something
var itemPickup = new Audio("../SoundEffects/itempickup.wav"); //sound for picking up an object
var itemDrop = new Audio("../SoundEffects/itemdrop.wav"); //sound for item hitting the floor

//game timer count down to 0 starting at startTime
var startTime = 30;
var transitionTime = 15;
playerStamina = MAX_STAMINA;
oppStamina = MAX_STAMINA;
var pageURL = window.location.search.substring(1)
if (pageURL) {
  var URLArray = pageURL.split('&');
  startTime = URLArray[0].split('=')[1];
  playerStamina = URLArray[1].split('=')[1];
  oppStamina = URLArray[2].split('=')[1];
}
var currTime = startTime;
var timerInterval = setInterval(function() {
  //initialize vars using passed in url to enable passing of arguments
  
  // move to new arena page if a certain amount of time has passed
  if (currTime == transitionTime && startTime != currTime) {
    transitionStage();
  }
  
  // end game if timer has run to 0
  if (currTime == 0) {
    endGame();
  }
  currTime--;
}, 1000); // update about every second
function transitionStage() {
  window.location.href = '../home-arena/home-arena.html?startTime=' + transitionTime + '&playerStamina='
  + player1.getStamina() + "&opponentStamina=" + opp1.getStamina();
}

function endGame() {
  clearInterval(drawInterval); //stop updating the canvas, also stops AIlogic and (player inputs)?
  clearInterval(timerInterval); //stop the timer
  var maxScore = 0;
  
  for (i = 0; i < entities.length; i++) {
    if (entities[i].isACharacter() == true) {
      if (entities[i].getScore() >= maxScore) {
        winner = entities[i];
        maxScore = winner.getScore();
      }
    }
  }
  
  //calculate 5% score bonus for each second remaining
  timeBonus = maxScore * 0.05;
  maxScore = maxScore + (timeBonus * currTime);
  
  //calculate remaining stamina bonus
  for (i = 0; i < winner.getStamina(); i += 10) {
    maxScore += 50;
  }
  
  //display basic game over window. Will replace with actual ending screen, this is just a placeholder
  alert("Entity " + winner.getEntityID() + " is the winner!\nScore: " + maxScore);
}

/*
/ Purpose: This class is to be used for all entities, those being player and
/           non-player characters within the game.
/
/ Variables:
/           entityImg: The image object for the entity
/           x: the x value on the 2d coordinant grid where the entity is located
/           y: the y value on the 2d coordinant grid where the entity is located
/           dx: the speed in which the entity moves in the x direction
/           dy: the speed in which the entity moves in the y direction
/           actionState: What is going on with the entity, are they bumping, just got hit, ect.
/           facingDirection: The direction the entity last moved in
/           hitCooldown: counter after being hit to avoid multiple hits in the same timeframe
/           actionCooldown: counter after doing an action to stop the spamming of actions
/           animationaCounter: Current animation frame for an action
/           stamina: an entity resource that determines when wins a match
/
*/
class Entity {
  entityImg = new Image();      //entityImg: The image object for the entity
  x = window.innerWidth/2;      //x: the x value on the 2d coordinant grid where the entity is located
  y = window.innerHeight/2;     //y: the y value on the 2d coordinant grid where the entity is located
  dx = 10;                      //dx: the speed in which the entity moves in the x direction
  dy = 10;                      //dy: the speed in which the entity moves in the y direction
  actionState = NORMAL_STATE;   //actionState: What is going on with the entity, are they bumping, just got hit, ect.
  facingDirection = RIGHT_DIR;  //facingDirection: The direction the entity last moved in
  knockbackDirection = RIGHT_DIR;
  hitCooldown = 0;              //hitCooldown: counter after being hit to avoid multiple hits in the same timeframe
  knockbackCooldown = 0;
  actionCooldown = 0;           //actionCooldown: counter after doing an action to stop the spamming of actions
  animationCounter = 0;         //animationaCounter: Current animation frame for an action
  entityID = 0;                 //An entities unique ID set before putting in entity list
  stamina = MAX_STAMINA;        //stamina: an entity resource that determines when wins a match
  holdingEnt = null;            /*
  / For destructible entities this is null when not being held
  / When held this is the entity holding them
  / for non-destructible entities this is null when not holding another entity
  / and when they are holding an entity it is the entity they are holding
  */
  score = 0;
  
  
  //initializing function
  constructor(height, width, src, destructibleObject, isCharacter) {
    this.entityImg.src = src;        //src: The link to the source file
    this.entityImg.width = width;    //width: The Width of the image
    this.entityImg.height = height;  //height: The height of the image
    this.destructibleObject = destructibleObject //true if Destructible Object, false if player or AI
    if (destructibleObject) {
      this.stamina = DESTRUCTIBLE_MAX_STAMINA;
    }
    this.isCharacter = isCharacter;
  }
  
  setIsCharacter(isCharacter) {
    this.isCharacter = isCharacter;
  }
  
  isACharacter() {
    return this.isCharacter;
  }
  
  getScore() {
    return this.score;
  }
  
  addScore(score) {
    this.score += score;
  }
  
  getActionState() {
    return this.actionState;
  }
  
  getFacingDirection() {
    return this.facingDirection;
  }
  
  getKnockbackDirection() {
    return this.knockbackDirection;
  }

  getAnimationCounter() {
    return this.animationCounter;
  }
  
  getHeight() {
    return this.entityImg.height;
  }
  
  getWidth() {
    return this.entityImg.width;
  }
  
  getImage() {
    return this.entityImg;
  }
  
  getX() {
    return this.x;
  }
  
  getY() {
    return this.y;
  }
  
  getDx() {
    return this.dx;
  }
  
  getDy() {
    return this.dy;
  }
  
  getHitCooldown() {
    return this.hitCooldown;
  }
  
  getKnockbackCooldown() {
    return this.knockbackCooldown;
  }

  getActionCooldown() {
    return this.actionCooldown;
  }
  
  getEntityID() {
    return this.entityID;
  }
  
  getStamina() {
    return this.stamina;
  }
  
  getDestructibleObject() {
    return this.destructibleObject;
  }
  
  getHoldingEnt() {
    return this.holdingEnt;
  }
  
  setActionState(actionState) {
    this.actionState = actionState;
  }
  
  setFacingDirection(facingDirection) {
    this.facingDirection = facingDirection;
  }

  setKnockbackDirection(knockbackDirection){
    this.knockbackDirection = knockbackDirection;
  }
  
  setAnimationCounter(animationCounter) {
    this.animationCounter = animationCounter;
  }
  
  setImageSrc(src) {
    this.entityImg.src = src;
  }
  
  setX(x) {
    this.x = x;
  }
  
  setY(y) {
    this.y = y;
  }
  
  setPosition(x,y) {
    this.x = x;
    this.y = y;
  }
  
  setDx(dx) {
    this.dx = dx;
  }
  
  setDy(dy) {
    this.dy = dy;
  }
  
  setHitCooldown(hitCooldown) {
    this.hitCooldown = hitCooldown;
  }
  
  setKnockbackCooldown(knockbackCooldown) {
    this.knockbackCooldown = knockbackCooldown;
  }

  setActionCooldown(actionCooldown) {
    this.actionCooldown = actionCooldown;
  }
  
  setEntityID(entityID) {
    this.entityID = entityID;
  }
  
  setStamina(stamina) {
    this.stamina = stamina;
  }
  
  //takes a boolean
  setDestructibleObject(destructibleObject) {
    this.destructibleObject = destructibleObject;
  }
  
  setWidth(width) {
    this.width = width;
  }
  
  //Takes an entity
  setHoldingEnt(holdingEnt) {
    this.holdingEnt = holdingEnt;
  }
  
  //Used to decrease or increase statmina by a set amount from the current total
  //negative numbers add to stamina positive numbers lower stamina.
  decreaseStamina(amount) {
    playerHit.play();
    if (this.stamina < amount && this.stamina != -1) {
      this.stamina = 0;
    } else if ( ( this.stamina - amount > MAX_STAMINA && !this.getDestructibleObject() ) || (this.stamina - amount > DESTRUCTIBLE_MAX_STAMINA && this.getDestructibleObject() ) ) {
      if (this.getDestructibleObject()) {
        this.stamina = DESTRUCTIBLE_MAX_STAMINA;
      } else {
        this.stamina = MAX_STAMINA;
      }
    } else {
      this.stamina = this.stamina - amount;
    }
    
    if (this.getDestructibleObject()) {
      if (this.stamina < (DESTRUCTIBLE_MAX_STAMINA/3)*2 + 1 && this.stamina > DESTRUCTIBLE_MAX_STAMINA/3 ) {
        this.setImageSrc("../Images/destroy_stage_2.png");
      }
      else if (this.stamina < DESTRUCTIBLE_MAX_STAMINA/3 + 1 && this.stamina >= 1) {
        this.setImageSrc("../Images/destroy_stage_9.png");
      }
      else if (this.stamina == 0) {
        shater.play();
        if (this.getEntityID() != '1') {
          document.getElementById(this.getEntityID()).remove();
        }
        const index = entities.indexOf(this);
        if (index > -1) {
          entities.splice(index, 1);
        }
        this.stamina = -1;
      }
    }
  }
  
  //Sets X and Y and the same time, only for convinence
  setStartingPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
//initialize player1
const player1 = new Entity(90, 70, 'https://www.cs.purdue.edu/people/images/small/faculty/gba.jpg', false, true);
player1.setStamina(playerStamina);
var vborderBounce = 20;
var borderBounce = 10;

//initialize opponent1
const opp1 = new Entity(90, 70, 'https://www.cs.purdue.edu/people/images/small/faculty/aliaga.jpg', false, true);
opp1.setStartingPosition(window.innerWidth/2+ 300, window.innerHeight/2);
opp1.setStamina(oppStamina);

//initialize UI
const gameUI = new Entity(50, window.innerWidth, '', true, false);
gameUI.setStartingPosition(0,0);

//initialize entity list (EntityID must be unique)
gameUI.setEntityID('1');
opp1.setEntityID('2');
player1.setEntityID('3');
var playerNumber = 3
var entities = new Array(gameUI);
var nonDesEntityNumber = 2;   //Number of non-destructible entities

//html ElementID Array
if (arena == FIRST_ARENA){
  var arenaElementIds = new Array('map_layer0_tile_17_1_0');  //Use for map-arena
}
else{
  var arenaElementIds = new Array('div1','div2','div3');   //Use for test-arena
}
for (var i = 0; i < arenaElementIds.length; i++) {
  var genElement = document.getElementById(arenaElementIds[i]);
  if (genElement != null){
    const tempEntity = new Entity(genElement.getBoundingClientRect().bottom - genElement.getBoundingClientRect().top, genElement.getBoundingClientRect().right - genElement.getBoundingClientRect().left, 'https://www.digitalscrapbook.com/sites/default/files/styles/456_scale/public/s3fs-user-content/template-image/user-12831/node-25755/my-baptism-checkered-doodles-overlay-template-doodle-checks-lines.png', true, false);
    tempEntity.setStartingPosition(genElement.getBoundingClientRect().left, genElement.getBoundingClientRect().top-CANVAS_OFFSET);
    tempEntity.setEntityID(arenaElementIds[i]);
    nonDesEntityNumber++;
    entities.push(tempEntity);
  }
}

entities.push(opp1);
entities.push(player1);

//Default Keyboard controls
//update these variables to allow for control changes in options menu
var p1BumpKey = "e";            //Player1 default bump key

// booleans for keyboard press
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var p1BumpPressed = false;      //Player1 has pressed the bump key?

//Debug variables
var showDebug = false;          //Show the debug overlay?
var hideEntities = false;       //Used to stop entities from being draw
var hideArena = false;          //Hides CS webpage background
var lastDraw = new Date();      //Time of last draw, used in FPS calculation
var fps_Count = 0;              //The total number of frames or draws
var tot_fps = 0;                //The time to draw each frame summed together

//Animation/Action variables
var bumpAniFrames = 14;         //Length of bump animation in frames
var bumpDistance = 80;          //How far the bump animation takes you forward
var bumpMovPerFrame = bumpDistance/(bumpAniFrames/2); //The distance the bump animation goes forward each frame
var pickupAniFrames = 7;       //Length of the pickup/drop animation in frames (calls to the draw function) for players/AI
var fallingAniFrames = 60;     //Length of falling animation for destructible objects that have been dropped

/*
/ Purpose: Changes the x/y position of an html element
/
/ Params:
/         elementID: the id assigned to the html element used to identify it.
/         x: the x position you want the element moved to
/         y: the y position you want the element moved to
/
/ Note: The destructible entity overlayed ontop of any html elements with an ID moves to the current location
/       of the html element it's connected to whenever the draw() function is called so moving
/       the html element moves the destructible entity overlayed ontop of it.
*/
function moveElement(elementID, x, y) {
  var tempY = y - CANVAS_OFFSET - MOVE_OFFSET_Y;
  var tempX = x + MOVE_OFFSET_X;
  var genE = document.getElementById(elementID);
  genE.style.position = "absolute";
  genE.style.left = tempX + 'px';
  genE.style.top = tempY + 'px';
}

/*
/ Purpose: Checks whether or not two objects are currently colliding with each
/          other.
/
/ Params:
/         object1: Assumed to be an entity object and a rectangle in shape.
/         object2: Assumed to be an entity object and a rectangle in shape.
/
/ return:
/         Returns true if the objects have collided, false otherwise.
/
/ note:
/         Does not account of non-entities being given as objects,
/         at the moment the function will crash for non-entitise.
*/
function rectCollisionCheck(entity1, entity2) {
  //Checks if either entity is to the right of the other
  if (entity1.getX() >= entity2.getX() + entity2.getWidth() || entity2.getX() >= entity1.getX() + entity1.getWidth()) {
    return false;
  }
  
  //Checks if either entity is below the other
  if (entity1.getY() >= entity2.getY() + entity2.getHeight() || entity2.getY() >= entity1.getY() + entity1.getHeight()) {
    return false;
  }
  
  return true;
}

//Animation/Action Functions Start

/* Purpose: During a bump action this function controls the rightward movement and collisionDetection
/
/ Params: bumpEnt - The entity that is performaing the rightward bump action
/
/ Note: Assumes an entity is given do not use non entities as it's parameter
*/
function entBumpRight(bumpEnt, multiplier = 1) {
  bumpMovement.play();  //Play bump sound effect
  multipliedBumpMov = bumpMovPerFrame * multiplier;
  if (bumpEnt.getX() + multipliedBumpMov  > canvas.width - bumpEnt.getWidth()) {
    bumpEnt.setX(canvas.width - bumpEnt.getWidth() - multipliedBumpMov);
  }
  bumpEnt.setX(bumpEnt.getX() + multipliedBumpMov);
  
  //check to see if any entities were collided with
  var hitSomething = false;
  for (var i = 0; i < entities.length; i++) {
    if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
      if (entities[i].getActionState() != HIT_STATE) {
        entities[i].decreaseStamina(BUMP_DAMAGE);
        if (entities[i].isACharacter() == true) {
          entities[i].setKnockbackDirection(RIGHT_DIR);
          bumpEnt.addScore(100);
          if (entities[i].getStamina() == 0) {
            endGame();
          }
        }
      }
      
      entities[i].setActionState(HIT_STATE);
      hitSomething = true;
    }
  }
  if ( hitSomething ) {
    bumpEnt.setX(bumpEnt.getX() - bumpMovPerFrame);
  }
}

/* Purpose: During a bump action this function controls the leftward movement and collisionDetection
/
/ Params: bumpEnt - The entity that is performaing the leftward bump action
/
/ Note: Assumes an entity is given do not use non entities as it's parameter
*/
function entBumpLeft(bumpEnt, multiplier=1) {
  bumpMovement.play();  //Play bump sound effect
  multipliedBumpMov = bumpMovPerFrame * multiplier;
  if(bumpEnt.getX() - multipliedBumpMov  < 0){
    bumpEnt.setX(multipliedBumpMov);
  }
  bumpEnt.setX(bumpEnt.getX() - multipliedBumpMov);
  
  //check to see if any entities were collided with
  var hitSomething = false;
  for (var i = 0; i < entities.length; i++) {
    if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
      if (entities[i].getActionState() != HIT_STATE) {
        entities[i].decreaseStamina(BUMP_DAMAGE);
        if (entities[i].isACharacter() == true) {
          entities[i].setKnockbackDirection(LEFT_DIR);
          bumpEnt.addScore(100);
          if (entities[i].getStamina() == 0) {
            endGame();
          }
        }
      }
      
      entities[i].setActionState(HIT_STATE);
      hitSomething = true;
    }
  }
  if ( hitSomething ) {
    bumpEnt.setX(bumpEnt.getX() + bumpMovPerFrame);
  }
}

/* Purpose: During a bump action this function controls the upward movement and collisionDetection
/
/ Params: bumpEnt - The entity that is performaing the upward bump action
/
/ Note: Assumes an entity is given do not use non entities as it's parameter
*/
function entBumpUp(bumpEnt, multiplier=1) {
  bumpMovement.play();  //Play bump sound effect
  multipliedBumpMov = bumpMovPerFrame * multiplier;
  if(bumpEnt.getY() + multipliedBumpMov <  0) {
    bumpEnt.setY(multipliedBumpMov);
  }
  bumpEnt.setY(bumpEnt.getY() - multipliedBumpMov);
  
  //check to see if any entities were collided with
  var hitSomething = false;
  for (var i = 0; i < entities.length; i++) {
    if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
      if (entities[i].getActionState() != HIT_STATE) {
        entities[i].decreaseStamina(BUMP_DAMAGE);
        if (entities[i].isACharacter() == true) {
          entities[i].setKnockbackDirection(UP_DIR);
          bumpEnt.addScore(100);
          if (entities[i].getStamina() == 0) {
            endGame();
          }
        }
      }
      
      entities[i].setActionState(HIT_STATE);
      hitSomething = true;
    }
  }
  if ( hitSomething ) {
    bumpEnt.setY(bumpEnt.getY() + bumpMovPerFrame);
  }
}

/* Purpose: During a bump action this function controls the downward movement and collisionDetection
/
/ Params: bumpEnt - The entity that is performaing the downward bump action
/
/ Note: Assumes an entity is given do not use non entities as it's parameter
*/
function entBumpDown(bumpEnt, multiplier=1) {
  bumpMovement.play();  //Play bump sound effect
  multipliedBumpMov = bumpMovPerFrame * multiplier;
  if (bumpEnt.getY() - multipliedBumpMov > canvas.height - bumpEnt.getHeight()) { // implement this in game
    bumpEnt.setY(canvas.height- bumpEnt.getHeight() - multipliedBumpMov);
  }
  bumpEnt.setY(bumpEnt.getY() + multipliedBumpMov);
  
  //check to see if any entities were collided with
  var hitSomething = false;
  for (var i = 0; i < entities.length; i++) {
    if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
      if (entities[i].getActionState() != HIT_STATE) {
        entities[i].decreaseStamina(BUMP_DAMAGE);
        if (entities[i].isACharacter() == true) {
          entities[i].setKnockbackDirection(DOWN_DIR);
          bumpEnt.addScore(100);
          if (entities[i].getStamina() == 0) {
            endGame();
          }
        }
      }
      
      entities[i].setActionState(HIT_STATE);
      hitSomething = true;
    }
  }
  if ( hitSomething ) {
    bumpEnt.setY(bumpEnt.getY() - bumpMovPerFrame);
  }
}

/*
/ Purpose: this function generically takes any entity and allows them to take the bump action
/
/ Details: the bump action is performed in the direction the entity last moved in. If you wish
/           to choose the direction of the bump make sure and update the entities facingDirection
/           to the desired bump direction immediatly before this function.
/
/ Params: bumpEntity - the entity that is performing the bump action
/
/ Notes: the function does not check to make sure the given parameter is an entity
/         make sure to only give this function entity objects.
/
*/
function entityBump(bumpEntity) {
  if (bumpEntity.getFacingDirection() == RIGHT_DIR) {
    if (bumpEntity.getAnimationCounter() <= bumpAniFrames/2) {
      entBumpRight(bumpEntity);
    }
    else {
      entBumpLeft(bumpEntity);
    }
  }
  else if (bumpEntity.getFacingDirection() == LEFT_DIR) {
    if (bumpEntity.getAnimationCounter() <= bumpAniFrames/2) {
      entBumpLeft(bumpEntity);
    }
    else {
      entBumpRight(bumpEntity);
    }
  }
  else if (bumpEntity.getFacingDirection() == UP_DIR) {
    if (bumpEntity.getAnimationCounter() <= bumpAniFrames/2) {
      entBumpUp(bumpEntity);
    }
    else {
      entBumpDown(bumpEntity);
    }
  }
  else if (bumpEntity.getFacingDirection() == DOWN_DIR) {
    if (bumpEntity.getAnimationCounter() <= bumpAniFrames/2) {
      entBumpDown(bumpEntity);
    }
    else {
      entBumpUp(bumpEntity);
    }
  }
  
  bumpEntity.setAnimationCounter(bumpEntity.getAnimationCounter() + 1);
  if (bumpEntity.getAnimationCounter() >= bumpAniFrames) {
    bumpEntity.setAnimationCounter(0);
    bumpEntity.setActionState(NORMAL_STATE);
    bumpEntity.setActionCooldown(ACTION_COOLDOWN);
  }
}

/*
/ Purpose: this function generically takes any entity checks to see if they are ontop of a destructible entity
/           that can be picked up, if so they pick it up.
/
/
/ Params: pickupEntity - the entity that is performing the pickup action
/
/
/ Notes: the function does not check to make sure the given parameter is an entity
/         make sure to only give this function entity objects.
/
*/
function entityPickup(pickupEntity) {
  if (pickupEntity.getAnimationCounter() == 0 && pickupEntity.getHoldingEnt() == null) {
    itemPickup.play();
    //check to see if any entities were collided with and can be picked up
    for (var i = 0; i < entities.length; i++) {
      if (rectCollisionCheck(pickupEntity, entities[i]) && entities[i].getDestructibleObject() && entities[i].getEntityID() != '1' && entities[i].getHoldingEnt() == null ) {
        entities[i].setDx( ( (pickupEntity.getX() - entities[i].getWidth()/2 + pickupEntity.getWidth()/2) - entities[i].getX() ) / pickupAniFrames);
        entities[i].setDy( ( (pickupEntity.getY() - entities[i].getHeight() + 10) - entities[i].getY() ) / pickupAniFrames);
        entities[i].setHoldingEnt(pickupEntity);
        pickupEntity.setHoldingEnt(entities[i]);
        break;
      }
    }
  }
  
  if (pickupEntity.getHoldingEnt() != null) {
    moveElement(pickupEntity.getHoldingEnt().getEntityID(), pickupEntity.getHoldingEnt().getX() + pickupEntity.getHoldingEnt().getDx(), pickupEntity.getHoldingEnt().getY() + pickupEntity.getHoldingEnt().getDy());
  }
  
  pickupEntity.setAnimationCounter(pickupEntity.getAnimationCounter() + 1);
  if (pickupEntity.getAnimationCounter() >= pickupAniFrames) {
    pickupEntity.setAnimationCounter(0);
    pickupEntity.setActionState(NORMAL_STATE);
    pickupEntity.setActionCooldown(ACTION_COOLDOWN);
    if (pickupEntity.getHoldingEnt() != null) {
      pickupEntity.getHoldingEnt().setDx(0);
      pickupEntity.getHoldingEnt().setDy(0);
    }
  }
}

/*
/ Purpose: this function generically takes any entity checks to see if they are already holding
/           an html element, if so they drop the element
/
/
/ Params: dropEntity - the entity that is performing the drop action
/
/
/ Notes: the function does not check to make sure the given parameter is an entity
/         make sure to only give this function entity objects.
/
*/
function entityDrop(dropEntity) {
  if (dropEntity.getAnimationCounter() == 0 && dropEntity.getHoldingEnt() != null) {
    //Holding a html element, drop the element.
    dropEntity.getHoldingEnt().setDy(0);
    dropEntity.getHoldingEnt().setDx(0);
    if (dropEntity.getFacingDirection() == RIGHT_DIR) {
      dropEntity.getHoldingEnt().setDx(5);
    } else if (dropEntity.getFacingDirection() == LEFT_DIR) {
      dropEntity.getHoldingEnt().setDx(-5);
    }
    else if (dropEntity.getFacingDirection() == UP_DIR) {
      dropEntity.getHoldingEnt().setDy(-5);
    } else {
      dropEntity.getHoldingEnt().setDy(5);
    }
    dropEntity.getHoldingEnt().setActionState(FALLING_STATE);
    dropEntity.getHoldingEnt().setAnimationCounter(0);
    dropEntity.getHoldingEnt().setHoldingEnt(null);
    dropEntity.setHoldingEnt(null);
  }
  
  dropEntity.setAnimationCounter(dropEntity.getAnimationCounter() + 1);
  if (dropEntity.getAnimationCounter() >= pickupAniFrames) {
    dropEntity.setAnimationCounter(0);
    dropEntity.setActionState(NORMAL_STATE);
    dropEntity.setActionCooldown(ACTION_COOLDOWN);
  }
}

//Animation/Action Functions End

/*
/ Purpose: draw any entity onto the screen based on it's current state
/
/ Params: Entity you want to draw
/
/ Notes: Will crash for non-entities
*/
function drawEntity(genEnt) {
  //Update HTML element to follow the entity that is holding it. Used when the entity that is being held up is being drawn.
  if (genEnt.getHoldingEnt() != null && genEnt.getDestructibleObject()) {
    if (genEnt.getHoldingEnt().getActionState() != PICKUP_STATE) {
      moveElement(genEnt.getEntityID(), genEnt.getHoldingEnt().getX() - genEnt.getWidth()/2 + genEnt.getHoldingEnt().getWidth()/2, genEnt.getHoldingEnt().getY() - genEnt.getHeight() + 10 );
    }
  }
  
  //HTML Element Reposition overlayed destructible entity to match current element location.
  if (genEnt.getDestructibleObject() && genEnt.getEntityID() != '1' && genEnt.getEntityID() != '2') {
    genEnt.setPosition(document.getElementById(genEnt.getEntityID()).getBoundingClientRect().left,document.getElementById(genEnt.getEntityID()).getBoundingClientRect().top-CANVAS_OFFSET);
  }
  
  //BUMPING_STATE highlight animation
  if (genEnt.getActionState() == BUMPING_STATE) {
    ctx.beginPath();
    ctx.rect(genEnt.getX()-5, genEnt.getY()-5, genEnt.getWidth()+10, genEnt.getHeight()+10);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
  //HIT_STATE highlight animation
  else if (genEnt.getActionState() == HIT_STATE) {
    if (genEnt.isACharacter() == true && genEnt.getKnockbackCooldown() <= KNOCKBACK_COOLDOWN) {
      genEnt.setKnockbackCooldown(genEnt.getKnockbackCooldown() + 1);
      if (genEnt.getKnockbackDirection() == RIGHT_DIR){
        entBumpRight(genEnt, BUMP_KNOCKBACK/KNOCKBACK_COOLDOWN);
      }
      if (genEnt.getKnockbackDirection() == LEFT_DIR) {
        entBumpLeft(genEnt, BUMP_KNOCKBACK/KNOCKBACK_COOLDOWN);
      }
      if (genEnt.getKnockbackDirection() == UP_DIR) {
        entBumpUp(genEnt, BUMP_KNOCKBACK/KNOCKBACK_COOLDOWN);
      }
      if (genEnt.getKnockbackDirection() == DOWN_DIR) {
        entBumpDown(genEnt, BUMP_KNOCKBACK/KNOCKBACK_COOLDOWN);
      }
    }
    
    //Draw Red Highlight
    ctx.beginPath();
    ctx.rect(genEnt.getX()-5, genEnt.getY()-5, genEnt.getWidth()+10, genEnt.getHeight()+10);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
    
    genEnt.setHitCooldown(genEnt.getHitCooldown() + 1);
    if (genEnt.getHitCooldown() > HIT_COOLDOWN) {
      genEnt.setActionState(NORMAL_STATE);
      genEnt.setHitCooldown(0);
      genEnt.setKnockbackCooldown(0);
    }
  }
  //FALLING_STATE (only applies to destructible entities)
  else if (genEnt.getActionState() == FALLING_STATE) {
    var slowDown = 1;
    //Drop right or left
    if (genEnt.getDx() != 0) {
      //Initial fall
      if (genEnt.getAnimationCounter() <= (4*fallingAniFrames)/10 ) {
        genEnt.setDy((300 / fallingAniFrames) );
        if (genEnt.getAnimationCounter() == (4*fallingAniFrames)/10) {
          itemDrop.play(); //dropped object sound
          slowDown = slowDown*2;
        }
      }
      //Bounce 1st time
      else if (genEnt.getAnimationCounter() <= (6*fallingAniFrames)/10) {
        genEnt.setDy((-100 / fallingAniFrames));
      } else if (genEnt.getAnimationCounter() <= (8*fallingAniFrames)/10) {
        genEnt.setDy((100 / fallingAniFrames));
        if (genEnt.getAnimationCounter() == (8*fallingAniFrames)/10 ) {
          itemDrop.play(); //dropped object sound
          slowDown = slowDown*2;
        }
      }
      //Bounce 2nd time
      else if (genEnt.getAnimationCounter() <= (9*fallingAniFrames)/10) {
        genEnt.setDy((-25 / fallingAniFrames));
      } else if (genEnt.getAnimationCounter() <= (fallingAniFrames)/10) {
        genEnt.setDy((25 / fallingAniFrames));
        if (genEnt.getAnimationCounter() == (fallingAniFrames)/10 ) {
          itemDrop.play(); //dropped object sound
          slowDown = slowDown*2;
        }
      }
      genEnt.setDx(genEnt.getDx()/slowDown );
    }
    //Drop Up or Down
    else {
      slowDown = 1;
      //Initial fall
      if (genEnt.getAnimationCounter() == (4*fallingAniFrames)/10) {
        itemDrop.play(); //dropped object sound
        slowDown = slowDown*2;
      }
      //Bounce 1st time
      if (genEnt.getAnimationCounter() == (8*fallingAniFrames)/10 ) {
        itemDrop.play(); //dropped object sound
        slowDown = slowDown*2;
      }
      //Bounce 2nd time
      if (genEnt.getAnimationCounter() == (fallingAniFrames)/10 ) {
        itemDrop.play(); //dropped object sound
        slowDown = slowDown*2;
      }
      genEnt.setDy(genEnt.getDy()/slowDown );
    }
    
    moveElement(genEnt.getEntityID(), genEnt.getX() + genEnt.getDx(), genEnt.getY() + genEnt.getDy() );
    
    genEnt.setAnimationCounter(genEnt.getAnimationCounter() + 1);
    if (genEnt.getAnimationCounter() >= fallingAniFrames) {
      itemDrop.play(); //dropped object sound
      genEnt.setActionState(NORMAL_STATE);
      genEnt.setAnimationCounter(0);
    }
  }
  
  ctx.beginPath();
  ctx.drawImage(genEnt.getImage(), genEnt.getX(), genEnt.getY(), genEnt.getWidth(), genEnt.getHeight());
  ctx.fill();
  ctx.closePath();
  
  //Show coordinates of html element and distructible entity overlay when dubug overlay is active
  if (showDebug) {
    if (genEnt.getDestructibleObject()) {
      ctx.font = "10px Helvetica";
      ctx.fillStyle = "#000000";
      if (genEnt.getEntityID() != '1' && genEnt.getEntityID() != '2') {
        ctx.fillText("PLAYER1:", genEnt.getX(), genEnt.getY()-60);
        ctx.fillText(player1.getX(), genEnt.getX(), genEnt.getY()-50);
        ctx.fillText(player1.getY(), genEnt.getX() + genEnt.getWidth()-20, genEnt.getY()-50);
        ctx.fillText("Destructible Overlay:", genEnt.getX(), genEnt.getY()-40);
        ctx.fillText(genEnt.getX(), genEnt.getX(), genEnt.getY()-30);
        ctx.fillText(genEnt.getY(), genEnt.getX()+genEnt.getWidth()-20, genEnt.getY()-30);
        ctx.fillText("HTML Element:", genEnt.getX(), genEnt.getY()-20);
        ctx.fillText(document.getElementById(genEnt.getEntityID()).getBoundingClientRect().left, genEnt.getX(), genEnt.getY()-10);
        ctx.fillText(document.getElementById(genEnt.getEntityID()).getBoundingClientRect().top, genEnt.getX()+genEnt.getWidth()-20, genEnt.getY()-10);
      }
    }
  }
  
  //Draw entity stamina bar after taking stamina damage
  var genEntMaxStam = MAX_STAMINA;
  if (genEnt.getDestructibleObject()) {
    genEntMaxStam = DESTRUCTIBLE_MAX_STAMINA;
  }
  if (genEnt.getStamina() < genEntMaxStam) {
    //Empty bar
    ctx.beginPath();
    ctx.rect(genEnt.getX(), genEnt.getY() + genEnt.getHeight(), genEnt.getWidth(), 6);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
    //Stamina bar
    ctx.beginPath();
    ctx.rect(genEnt.getX(), genEnt.getY() + genEnt.getHeight(), (genEnt.getWidth()*genEnt.getStamina())/genEntMaxStam, 6);
    ctx.fillStyle = "#ccbb91";
    ctx.fill();
    ctx.closePath();
  }
  
  //decrement Action Cooldown if it's above 0
  if (genEnt.getActionCooldown() > 0) {
    genEnt.setActionCooldown(genEnt.getActionCooldown() - 1);
  }
  
  if (genEnt.getEntityID() == gameUI.getEntityID()) {
    drawGamePlayOverlay();
  }
}

//Draw Gameplay overlay, currently just character stamina
function drawGamePlayOverlay() {
  var yOffset = 10;
  gameUI.setWidth(window.innerWidth);
  //Base UI
  ctx.beginPath();
  ctx.rect(0, 0, window.innerWidth, gameUI.getHeight());
  //ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.rect(2, 2, window.innerWidth-2, gameUI.getHeight()-4);
  ctx.fillStyle = "#ccbb91";
  ctx.fill();
  ctx.closePath();
  //Stamina Bars for non-destructible entities (players/AI)
  ctx.globalAlpha = 1;
  //Empty bar
  ctx.beginPath();
  ctx.rect(gameUI.getX()+20, (gameUI.getHeight()/4)+1, (gameUI.getWidth()/3)-20, gameUI.getHeight()/2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
  //Stamina bar
  ctx.beginPath();
  ctx.rect(gameUI.getX()+22, (gameUI.getHeight()/4)+3, ((((gameUI.getWidth()/3)-20)*player1.getStamina())/100)-4, (gameUI.getHeight()/2)-4);
  ctx.fillStyle = "#ccbb91";
  ctx.fill();
  ctx.closePath();
  //PLAYER
  ctx.font = "15px Helvetica";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("PLAYER STAMINA", 25, (gameUI.getHeight()/4)+yOffset+8);
  
  //Timer
  ctx.font = "20px Helvetica";
  ctx.fillStyle = "#000000";
  ctx.fillText(currTime, gameUI.getWidth()/2-20, 23+yOffset);
  
  //Empty bar
  ctx.beginPath();
  ctx.rect((gameUI.getWidth()/3)*2-20, (gameUI.getHeight()/4)+1, (gameUI.getWidth()/3)-20, gameUI.getHeight()/2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
  //Stamina bar
  ctx.beginPath();
  ctx.rect((gameUI.getWidth()/3)*2-18, (gameUI.getHeight()/4)+3, ((((gameUI.getWidth()/3)-20)*opp1.getStamina())/100)-4, (gameUI.getHeight()/2)-4);
  ctx.fillStyle = "#ccbb91";
  ctx.fill();
  ctx.closePath();
  //OPPONENT
  ctx.font = "15px Helvetica";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("OPPONENT STAMINA", (gameUI.getWidth()/3)*2-15, (gameUI.getHeight()/4)+yOffset+8);
}

//Show Debug information
function drawDebugInfo() {
  var dbListPos = 20;     //Starting Y position for the debug overlay
  //calculate fps
  var thisDraw = new Date();              //current time
  var fps = 1000 / (thisDraw - lastDraw); //estimated frames per second
  
  //Calculate avg fps
  fps_Count++;
  if (fps_Count > 60) {
    fps_Count = 0;
    tot_fps = 0;
  }
  tot_fps = tot_fps + fps;
  var avg_fps = tot_fps / fps_Count;    //The Average estimated FPS
  avg_fps = avg_fps.toFixed(1);
  lastDraw = thisDraw
  
  //Draw background
  ctx.beginPath();
  ctx.rect(0, 0, 220, dbListPos*10);
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1;
  
  //Draw stats
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("AnimationCounter: "+player1.getAnimationCounter(), 8, dbListPos);
  ctx.fillText("Player1ActionState: "+player1.getActionState(), 8, dbListPos*2);
  ctx.fillText("Player1FacingDir: "+player1.getFacingDirection(), 8, dbListPos*3);
  ctx.fillText("Player1Stamina: "+player1.getStamina(), 8, dbListPos*4);
  ctx.fillText("Opp1ActionState: "+opp1.getActionState(), 8, dbListPos*5);
  ctx.fillText("Opp1FacingDir: "+opp1.getFacingDirection(), 8, dbListPos*6);
  ctx.fillText("Opp1Stamina: "+opp1.getStamina(), 8, dbListPos*7);
  ctx.fillText("Opp1HitCooldown: "+opp1.getHitCooldown(), 8, dbListPos*8);
  ctx.fillText("FPS: "+avg_fps, 8, dbListPos*9);
}

//Main Draw function, responsible for drawing each frame
function draw() {
  // adjust canvas size so that borders of game move with window size
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  
  //When no special actions are being taken by player1: allows free movement
  if (player1.actionState == NORMAL_STATE) {
    var collisionAmount = 0;
    // move right and adjust if outside window border
    if(rightPressed) {
      if (player1.getX()+player1.getDx()  > canvas.width - player1.getWidth()) {
        player1.setX(canvas.width - player1.getWidth() - borderBounce);
      }
      player1.setX(player1.getX() + player1.getDx());
      
      //check to see if any entities were collided with
      var hitSomething = false;
      for (var i = 0; i < entities.length; i++) {
        if (rectCollisionCheck(player1, entities[i]) && player1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
          hitSomething = true;
          collisionAmount = ( player1.getX() + player1.getWidth()) - entities[i].getX() + 1;
        }
      }
      if ( hitSomething ) {
        player1.setX(player1.getX() - collisionAmount);
      }
      player1.setFacingDirection(RIGHT_DIR);
    }
    
    // move left and adjust if outside window border
    if (leftPressed){
      if(player1.getX() - player1.getDx()  < 0){
        player1.setX(borderBounce);
      }
      player1.setX(player1.getX() - player1.getDx());
      
      //check to see if any entities were collided with
      var hitSomething = false;
      for (var i = 0; i < entities.length; i++) {
        if (rectCollisionCheck(player1, entities[i]) && player1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
          hitSomething = true;
          collisionAmount = ( entities[i].getX() + entities[i].getWidth()) - player1.getX() + 1;
        }
      }
      if ( hitSomething ) {
        player1.setX(player1.getX() + collisionAmount);
      }
      player1.setFacingDirection(LEFT_DIR);
    }
    
    // move up and adjust if outside window border
    if(upPressed){
      if(player1.getY() + player1.getDy() <  0) {
        player1.setY(player1.getY() + player1.getDy());
      }
      player1.setY(player1.getY() - player1.getDy());
      
      //check to see if any entities were collided with
      var hitSomething = false;
      for (var i = 0; i < entities.length; i++) {
        if (rectCollisionCheck(player1, entities[i]) && player1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
          hitSomething = true;
          collisionAmount = (entities[i].getY() + entities[i].getHeight()) - player1.getY() + 1;
        }
      }
      if ( hitSomething ) {
        player1.setY(player1.getY() + collisionAmount);
      }
      player1.setFacingDirection(UP_DIR);
    }
    
    // move down and adjust if outside window border
    if(downPressed){
      if (player1.getY() - player1.getDy() > canvas.height - player1.getHeight()) { // implement this in game
        //player1.setY(canvas.height - player1.getHeight() - vborderBounce);
        player1.setY(player1.getY() - player1.getDy());
      }
      player1.setY(player1.getY() + player1.getDy());
      
      //check to see if any entities were collided with
      var hitSomething = false;
      for (var i = 0; i < entities.length; i++) {
        if (rectCollisionCheck(player1, entities[i]) && player1.getEntityID() != entities[i].getEntityID() && !entities[i].getDestructibleObject()) {
          hitSomething = true;
          collisionAmount = (player1.getY() + player1.getHeight()) - entities[i].getY() + 1;
        }
      }
      if ( hitSomething ) {
        player1.setY(player1.getY() - collisionAmount);
      }
      player1.setFacingDirection(DOWN_DIR);
    }
  }
  //When player1 is performing a bump action
  else if (player1.getActionState() == BUMPING_STATE) {
    entityBump(player1);
  }
  
  //When player1 is attempting to pickup an object
  else if (player1.getActionState() == PICKUP_STATE) {
    entityPickup(player1);
  }
  
  //When player1 is attemptingto drop an object
  else if (player1.getActionState() == DROP_STATE) {
    entityDrop(player1);
  }
  
  //AI takes its actions after the player
  AILogic();
  
  // clear the canvas to redraw screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (hideArena) {
    ctx.beginPath();
    ctx.rect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath;
  }
  
  //Draws each entity
  if (!hideEntities) {
    for (var i = 0; i < entities.length; i++) {
      drawEntity(entities[i]);
    }
  }
  
  //Check for debug overlay flag
  if (showDebug) {
    drawDebugInfo();
  }
}

// code to detect keyboard press
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
  else if (e.key == "Up" || e.key == "ArrowUp"){
    upPressed = true;
  }
  else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = true;
  }
  else if (e.key == p1BumpKey) {
    if (player1.getActionCooldown() == 0) {
      p1BumpPressed = true;
      player1.setActionState(BUMPING_STATE);
    }
  }
  else if (e.key == "l") {
    showDebug = !showDebug;
  }
  else if (e.key == "h") {
    hideEntities = !hideEntities;
  }
  else if (e.key == "v") {
    player1.decreaseStamina(10);
    opp1.decreaseStamina(10);
  }
  else if (e.key == "z") {
    player1.decreaseStamina(-10);
    opp1.decreaseStamina(-10);
  }
  else if (e.key == "n") {
    hideArena = !hideArena;
  }
  else if (e.key == "t") {
    currTime = 3000;
  }
  else if (e.key == "f") {
    if (player1.getActionCooldown() == 0) {
      if (player1.getHoldingEnt() != null) {
        player1.setActionState(DROP_STATE);
      } else {
        player1.setActionState(PICKUP_STATE);
      }
    }
  }
}

function keyUpHandler(e) {
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
    e.preventDefault();
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
    e.preventDefault();
  }
  else if (e.key == "Up" || e.key == "ArrowUp"){
    upPressed = false;
    e.preventDefault();
  }
  else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = false;
    e.preventDefault();
  }
  else if (e.key == p1BumpKey) {
    p1BumpPressed = false;
  }
}
var drawInterval = setInterval(draw, 10);
