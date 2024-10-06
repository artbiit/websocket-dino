class Player {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;
  dinoRunImages = [];

  // 점프 상태값
  jumpPressed = false;
  jumpInProgress = false;
  falling = false;

  JUMP_SPEED = 0.6;
  GRAVITY = 0.4;

  // 리플레이 기능 관련 변수
  replayLog = []; // 리플레이를 위한 기록
  lastEventTime = 0;
  recording = false;

  // 생성자
  set(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio, opacity = 1.0) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;
    this.opacity = opacity;

    this.x = 10 * scaleRatio;
    this.y = this.canvas.height - this.height - 1.5 * scaleRatio;
    this.yStandingPosition = this.y;

    this.standingStillImage = new Image();
    this.standingStillImage.src = 'images/standing_still.png';
    this.image = this.standingStillImage;

    const dinoRunImage1 = new Image();
    dinoRunImage1.src = 'images/dino_run1.png';

    const dinoRunImage2 = new Image();
    dinoRunImage2.src = 'images/dino_run2.png';

    this.dinoRunImages.push(dinoRunImage1);
    this.dinoRunImages.push(dinoRunImage2);

    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
  }

  keydown = (event) => {
    if (event.code === 'Space' && this.recording) {
      this.logEvent('jump');
      this.jumpPressed = true;
    }
  };

  keyup = (event) => {
    if (event.code === 'Space' && this.recording) {
      this.jumpPressed = false;
    }
  };

  // 점프 로직
  jump(deltaTime) {
    if (this.jumpPressed) {
      this.jumpInProgress = true;
    }

    if (this.jumpInProgress && !this.falling) {
      if (
        this.y > this.canvas.height - this.minJumpHeight ||
        (this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed)
      ) {
        this.y -= this.JUMP_SPEED * deltaTime * this.scaleRatio;
      } else {
        this.falling = true;
        this.jumpInProgress = false;
        this.logEvent('fall'); // 점프가 끝나면 자동으로 낙하 이벤트 기록
      }
    } else {
      if (this.y < this.yStandingPosition) {
        this.y += this.GRAVITY * deltaTime * this.scaleRatio;

        if (this.y + this.height > this.canvas.height) {
          this.y = this.yStandingPosition;
        }
      } else {
        this.falling = false;
        this.jumpInProgress = false;
      }
    }
  }

  // 리플레이 기록을 남기는 함수
  logEvent(action) {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastEventTime;

    // 동일한 이벤트가 연속으로 기록되지 않도록 처리
    if (
      this.replayLog.length === 0 ||
      this.replayLog[this.replayLog.length - 1].action !== action
    ) {
      this.replayLog.push({ action, time: deltaTime });
    }

    this.lastEventTime = currentTime;
  }

  update(gameSpeed, deltaTime) {
    this.run(gameSpeed, deltaTime);
    if (this.jumpInProgress) {
      this.image = this.standingStillImage;
    }
    this.jump(deltaTime);
  }

  run(gameSpeed, deltaTime) {
    if (this.walkAnimationTimer <= 0) {
      this.image =
        this.image === this.dinoRunImages[0] ? this.dinoRunImages[1] : this.dinoRunImages[0];
      this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    }
    this.walkAnimationTimer -= deltaTime * gameSpeed;
  }

  draw() {
    this.ctx.globalAlpha = this.opacity;
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    this.ctx.globalAlpha = 1.0;
  }

  startRecording() {
    this.lastEventTime = performance.now();
    this.replayLog = [];
    this.recording = true;
  }

  // 리플레이 녹화를 중단하고 데이터를 반환하는 함수
  stopRecording() {
    this.recording = false;
    return this.replayLog;
  }

  // 리플레이 데이터를 반환하는 함수
  getReplayData() {
    return this.replayLog;
  }
}

const player = new Player();
export default player;
