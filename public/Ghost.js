class Ghost {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;
  dinoRunImages = [];
  image = null;

  constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio, opacity = 0.5) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;
    this.opacity = opacity;

    this.x = 10 * scaleRatio;
    this.yStandingPosition = this.canvas.height - this.height - 1.5 * scaleRatio;
    this.y = this.yStandingPosition;
    this.falling = false;
    this.jumpInProgress = false;
    this.JUMP_SPEED = 0.6 * this.scaleRatio;
    this.GRAVITY = 0.4 * this.scaleRatio;

    this.distanceTraveled = 0;
    this.maxDistance = 0;

    this.loadImages();
  }

  loadImages() {
    const dinoRunImage1 = new Image();
    dinoRunImage1.src = 'images/dino_run1.png';
    const dinoRunImage2 = new Image();
    dinoRunImage2.src = 'images/dino_run2.png';

    this.dinoRunImages.push(dinoRunImage1);
    this.dinoRunImages.push(dinoRunImage2);

    this.image = dinoRunImage1;
  }

  startGhost(distance) {
    this.playing = true;
    this.elapsedTime = 0;
    this.distanceTraveled = 0;
    this.maxDistance = distance;
    this.resetPosition();
  }

  resetPosition() {
    this.y = this.yStandingPosition;
    this.jumpInProgress = false;
    this.falling = false;
  }

  checkAndJump(cactiController, gameSpeed, deltaTime) {
    const obstacle = cactiController.getClosestCactus();
    if (!obstacle) return;

    const distanceToCactus = obstacle.x - this.x;
    const jumpTriggerDistance = this.calculateJumpTriggerDistance(obstacle, gameSpeed);

    if (distanceToCactus <= jumpTriggerDistance && !this.jumpInProgress && !this.falling) {
      this.jumpInProgress = true;
      this.falling = false;
    }

    this.updatePlayerPosition(deltaTime);

    this.distanceTraveled += gameSpeed * deltaTime * 0.001;

    if (this.distanceTraveled >= this.maxDistance) {
      this.playing = false;
    }
  }
  calculateJumpTriggerDistance(obstacle, gameSpeed) {
    const obstacleWidth = obstacle.width;
    const obstacleHeight = obstacle.height;

    const requiredJumpDistance = obstacleWidth + (obstacleHeight / this.JUMP_SPEED) * gameSpeed;
    return requiredJumpDistance;
  }

  updatePlayerPosition(deltaTime) {
    if (this.jumpInProgress && !this.falling) {
      if (
        this.y > this.canvas.height - this.minJumpHeight ||
        this.y > this.canvas.height - this.maxJumpHeight
      ) {
        this.y -= this.JUMP_SPEED * deltaTime;
      } else {
        this.falling = true;
      }
    } else if (this.falling) {
      if (this.y < this.yStandingPosition) {
        this.y += this.GRAVITY * deltaTime;
      } else {
        this.y = this.yStandingPosition;
        this.falling = false;
        this.jumpInProgress = false;
      }
    }
  }

  run() {
    if (this.walkAnimationTimer <= 0) {
      this.image =
        this.image === this.dinoRunImages[0] ? this.dinoRunImages[1] : this.dinoRunImages[0];
      this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    }
    this.walkAnimationTimer--;
  }

  draw() {
    if (!this.playing) return;
    this.run();
    this.ctx.globalAlpha = this.opacity;
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    this.ctx.globalAlpha = 1.0;
  }
}
export default Ghost;
