// initialize canvas
  var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d"); // we use this 2d rendering context to actually paint on the canvas

  //Constants
  var NORMAL_STATE = "normal";
  var BUMPING_STATE = "bumping";
  var HIT_STATE = "hit";
  var HIT_COOLDOWN = 15;                  //amount of immune to damage time after being hit
  var ACTION_COOLDOWN = 15;               //number of frames between actions (time delay between actions)
  var UP_DIR = "up";
  var DOWN_DIR = "down";
  var RIGHT_DIR = "right";
  var LEFT_DIR = "left";
  var MAX_STAMINA = 100;                  //max stamina for players or AI
  var DESTRUCTIBLE_MAX_STAMINA = 30;      //max stamina for destructible objects
  var BUMP_DAMAGE = 10;                   //stamina damage delt with any successful bumpaction

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
    hitCooldown = 0;              //hitCooldown: counter after being hit to avoid multiple hits in the same timeframe
    actionCooldown = 0;           //actionCooldown: counter after doing an action to stop the spamming of actions
    animationCounter = 0;         //animationaCounter: Current animation frame for an action
    entityID = 0;                 //An entities unique ID set before putting in entity list
    stamina = MAX_STAMINA;        //stamina: an entity resource that determines when wins a match


    //initializing function
    constructor(height, width, src, destructibleObject) {
    	this.entityImg.src = src;        //src: The link to the source file
    	this.entityImg.width = width;    //width: The Width of the image
    	this.entityImg.height = height;  //height: The height of the image
      this.destructibleObject = destructibleObject //true if Destructible Object, false if player or AI
      if (destructibleObject) {
        this.stamina = DESTRUCTIBLE_MAX_STAMINA;
      }
    }

    getActionState() {
      return this.actionState;
    }

    getFacingDirection() {
      return this.facingDirection;
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

    setActionState(actionState) {
      this.actionState = actionState;
    }

    setFacingDirection(facingDirection) {
      this.facingDirection = facingDirection;
    }

    setAnimationCounter(animationCounter) {
      this.animationCounter = animationCounter;
    }

    setX(x) {
      this.x = x;
    }

    setY(y) {
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

    setActionCooldown(actionCooldown) {
      this.actionCooldown = actionCooldown;
    }

    setEntityID(entityID) {
      this.entityID = entityID;
    }

    setStamina(stamina) {
      this.stamina = stamina;
    }

    setDestructibleObject(destructibleObject) {
      this.destructibleObject = destructibleObject;
    }

    setWidth(width) {
      this.width = width;
    }

    decreaseStamina(amount) {
      if (this.stamina < amount) {
        this.stamina = 0;
      } else {
        this.stamina = this.stamina - amount;
      }
    }

    //Sets X and Y and the same time, only for convinence
    setStartingPosition(x, y) {
      this.x = x;
      this.y = y;
    }
  }

	//initialize player1
  const player1 = new Entity(90, 70, 'https://www.cs.purdue.edu/people/images/small/faculty/gba.jpg', false);
	var vborderBounce = 20;
  var borderBounce = 10;

  //initialize opponent1
  const opp1 = new Entity(90, 70, 'https://www.cs.purdue.edu/people/images/small/faculty/aliaga.jpg', false);
  opp1.setStartingPosition(window.innerWidth/2+ 300, window.innerHeight/2);

  //initialize UI
  const gameUI = new Entity(100, window.innerWidth, 'https://teamcolorcodes.com/wp-content/uploads/2017/10/Purdue-Boilermakers-Color-Palette-Image.png', true );
  gameUI.setStartingPosition(0,0);

  //initialize testEntity
  const testDestructible = new Entity(100, 300, 'https://i.stack.imgur.com/d3Koo.jpg', true);
  testDestructible.setStartingPosition(300, 300);

  //initialize entity list (EntityID must be unique)
  gameUI.setEntityID(1);
  testDestructible.setEntityID(2);
  opp1.setEntityID(3);
  player1.setEntityID(4);
  var entities = new Array(gameUI, testDestructible, opp1, player1);
  var nonDesEntityNumber = 2;   //Number of non-destructible entities

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
  var lastDraw = new Date();      //Time of last draw, used in FPS calculation
  var fps_Count = 0;              //The total number of frames or draws
  var tot_fps = 0;                //The time to draw each frame summed together

  //Animation/Action variables
  var bumpAniFrames = 14;         //Length of bump animation in frames
  var bumpDistance = 80;          //How far the bump animation takes you forward
  var bumpMovPerFrame = bumpDistance/(bumpAniFrames/2); //The distance the bump animation goes forward each frame

  /*
  / Purpose: Checks whether or not two objects are currently colliding with each
  /          other. Specifically, it looks at the four corners of object1 (assumed
  /          to be a rectangle) and check to see if any of those corners are
  /          inside the area of object2 (Also assumed to be a rectangle).
  /
  / Params:
  /         object1: Assumed to be an entity object and a rectangle in shape.
  /         object2: Assumed to be an entity object and a rectangle in shape.
  /
  / return:
  /         Returns true if the objects have collided, false otherwise.
  /
  / note:
  /         Should be updated to account of non-entities being given as objects,
  /         at the moment the function will crash for non-entitise.
  */
  function rectCollisionCheck(object1, object2) {
      if (
        //x + w, y
        ( ( object1.getX() + object1.getWidth() >= object2.getX() && object1.getX() + object1.getWidth() <= object2.getX() + object2.getWidth() ) &&
        ( object1.getY() >= object2.getY() && object1.getY() <= object2.getY() + object2.getHeight() ) ) ||
        //x, y
        ( ( object1.getX() >= object2.getX() && object1.getX() <= object2.getX() + object2.getWidth() ) &&
        ( object1.getY() >= object2.getY() && object1.getY() <= object2.getY() + object2.getHeight() ) ) ||
        //x + w, y + h
        ( ( object1.getX() + object1.getWidth() >= object2.getX() && object1.getX() + object1.getWidth() <= object2.getX() + object2.getWidth() ) &&
        ( object1.getY() + object1.getHeight() >= object2.getY() && object1.getY() + object1.getHeight() <= object2.getY() + object2.getHeight() ) ) ||
        //x, y + h
        ( ( object1.getX() >= object2.getX() && object1.getX() <= object2.getX() + object2.getWidth() ) &&
        ( object1.getY() + object1.getHeight() >= object2.getY() && object1.getY() + object1.getHeight() <= object2.getY() + object2.getHeight() ) ) ) {
          return true;
      }
      return false;
    }

  //Animation/Action Functions Start

  /* Purpose: During a bump action this function controls the rightward movement and collisionDetection
  /
  / Params: bumpEnt - The entity that is performaing the rightward bump action
  /
  / Note: Assumes an entity is given do not use non entities as it's parameter
  */
  function entBumpRight(bumpEnt) {
    if (bumpEnt.getX() + bumpMovPerFrame  > canvas.width - bumpEnt.getWidth()) {
      bumpEnt.setX(canvas.width - bumpEnt.getWidth() - bumpMovPerFrame);
    }
    bumpEnt.setX(bumpEnt.getX() + bumpMovPerFrame);

    //check to see if any entities were collided with
    var hitSomething = false;
    for (var i = 0; i < entities.length; i++) {
      if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
        if (entities[i].getActionState() != HIT_STATE) {
          entities[i].decreaseStamina(BUMP_DAMAGE);
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
  function entBumpLeft(bumpEnt) {
    if(bumpEnt.getX() - bumpMovPerFrame  < 0){
        bumpEnt.setX(bumpMovPerFrame);
    }
    bumpEnt.setX(bumpEnt.getX() - bumpMovPerFrame);

    //check to see if any entities were collided with
    var hitSomething = false;
    for (var i = 0; i < entities.length; i++) {
      if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
        if (entities[i].getActionState() != HIT_STATE) {
          entities[i].decreaseStamina(BUMP_DAMAGE);
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
  function entBumpUp(bumpEnt) {
    if(bumpEnt.getY() + bumpMovPerFrame <  0) {
      bumpEnt.setY(bumpMovPerFrame);
    }
    bumpEnt.setY(bumpEnt.getY() - bumpMovPerFrame);

    //check to see if any entities were collided with
    var hitSomething = false;
    for (var i = 0; i < entities.length; i++) {
      if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
        if (entities[i].getActionState() != HIT_STATE) {
          entities[i].decreaseStamina(BUMP_DAMAGE);
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
  function entBumpDown(bumpEnt) {
    if (bumpEnt.getY() - bumpMovPerFrame > canvas.height - bumpEnt.getHeight()) { // implement this in game
      bumpEnt.setY(canvas.height- bumpEnt.getHeight() - bumpMovPerFrame);
    }
    bumpEnt.setY(bumpEnt.getY() + bumpMovPerFrame);

    //check to see if any entities were collided with
    var hitSomething = false;
    for (var i = 0; i < entities.length; i++) {
      if (rectCollisionCheck(bumpEnt, entities[i]) && bumpEnt.getEntityID() != entities[i].getEntityID()) {
        if (entities[i].getActionState() != HIT_STATE) {
          entities[i].decreaseStamina(BUMP_DAMAGE);
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
  / Notes: the function does not check to make sure the given parameter is an entityID
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

  //Animation/Action Functions End

  /*
  / Purpose: draw any entity onto the screen based on it's current state
  /
  / Params: Entity you want to draw
  /
  / Notes: Will crash for non-entities
  */
  function drawEntity(genEnt) {
    //BUMPING_STATE highlight animation
    if (genEnt.getActionState() == BUMPING_STATE) {
        ctx.beginPath();
        ctx.rect(genEnt.getX()-5, genEnt.getY()-5, genEnt.getWidth()+10, genEnt.getHeight()+10);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath;
    }
    //HIT_STATE highlight animation
    else if (genEnt.getActionState() == HIT_STATE) {
        genEnt.setHitCooldown(genEnt.getHitCooldown() + 1);
        ctx.beginPath();
        ctx.rect(genEnt.getX()-5, genEnt.getY()-5, genEnt.getWidth()+10, genEnt.getHeight()+10);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.closePath;
        if (genEnt.getHitCooldown() > HIT_COOLDOWN) {
          genEnt.setActionState(NORMAL_STATE);
          genEnt.setHitCooldown(0);
        }
    }

    ctx.beginPath();
    ctx.drawImage(genEnt.getImage(), genEnt.getX(), genEnt.getY(), genEnt.getWidth(), genEnt.getHeight());
    ctx.fill();
	  ctx.closePath();

    //Draw entity stamina bar when dubug overlay is active
    if (showDebug) {
      var genEntMaxStam = MAX_STAMINA;
      if (genEnt.getDestructibleObject()) {
        genEntMaxStam = DESTRUCTIBLE_MAX_STAMINA;
      }
      //Empty bar
      ctx.beginPath();
      ctx.rect(genEnt.getX(), genEnt.getY() + genEnt.getHeight(), genEnt.getWidth(), 6);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.closePath;
      //Stamina bar
      ctx.beginPath();
      ctx.rect(genEnt.getX(), genEnt.getY() + genEnt.getHeight(), (genEnt.getWidth()*genEnt.getStamina())/genEntMaxStam, 6);
      ctx.fillStyle = "#ccbb91";
      ctx.fill();
      ctx.closePath;
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
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath;
    ctx.beginPath();
    ctx.rect(2, 2, window.innerWidth-21, gameUI.getHeight()-4);
    ctx.fillStyle = "#ccbb91";
    ctx.fill();
    ctx.closePath;
    //Stamina Bars for non-destructible entities (players/AI)
    //PLAYER
    ctx.font = "20px Elephant";
    ctx.fillStyle = "#000000";
    ctx.fillText("PLAYER STAMINA", 20, 23+yOffset);
    //Empty bar
    ctx.beginPath();
    ctx.rect(gameUI.getX()+20, (gameUI.getHeight()/3)+yOffset, (gameUI.getWidth()/3)-20, gameUI.getHeight()/3);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
    //Stamina bar
    ctx.beginPath();
    ctx.rect(gameUI.getX()+22, (gameUI.getHeight()/3)+2+yOffset, ((((gameUI.getWidth()/3)-20)*player1.getStamina())/100)-4, (gameUI.getHeight()/3)-4);
    ctx.fillStyle = "#ccbb91";
    ctx.fill();
    ctx.closePath;


    //OPPONENT
    ctx.font = "20px Elephant";
    ctx.fillStyle = "#000000";
    ctx.fillText("OPPONENT STAMINA", (gameUI.getWidth()/3)*2-20, 23+yOffset);
    //Empty bar
    ctx.beginPath();
    ctx.rect((gameUI.getWidth()/3)*2-20, (gameUI.getHeight()/3)+yOffset, (gameUI.getWidth()/3)-20, gameUI.getHeight()/3);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath;
    //Stamina bar
    ctx.beginPath();
    ctx.rect((gameUI.getWidth()/3)*2-18, (gameUI.getHeight()/3)+2+yOffset, ((((gameUI.getWidth()/3)-20)*opp1.getStamina())/100)-4, (gameUI.getHeight()/3)-4);
    ctx.fillStyle = "#ccbb91";
    ctx.fill();
    ctx.closePath;
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
    ctx.closePath;
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
            }
          }
          if ( hitSomething ) {
            player1.setY(player1.getY() + player1.getDy());
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
            }
          }
          if ( hitSomething ) {
            player1.setY(player1.getY() - player1.getDy());
          }
          player1.setFacingDirection(DOWN_DIR);
          }
      }
      //When player1 is performing a bump action
      else if (player1.getActionState() == BUMPING_STATE) {
          entityBump(player1);
      }
  		// clear the canvas to redraw screen
	    ctx.clearRect(0, 0, canvas.width, canvas.height);

      //Draws each entity
      for (var i = 0; i < entities.length; i++) {
        drawEntity(entities[i]);
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
          player1.setActionState("bumping");
        }
      }
      else if (e.key == "l") {
        showDebug = !showDebug
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
	setInterval(draw, 10);