import Cactus from './Cactus.js';
import GameManager from './GameManager.js';

class CactiController {
  CACTUS_INTERVAL_MIN = 500;
  CACTUS_INTERVAL_MAX = 2000;

  nextCactusInterval = null;
  cacti = [];
  rng = null;

  constructor(ctx, cactiImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.cactiImages = cactiImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.rng = GameManager.rng;

    this.setNextCactusTime();
  }

  setNextCactusTime() {
    this.nextCactusInterval = this.getRandomNumber(
      this.CACTUS_INTERVAL_MIN,
      this.CACTUS_INTERVAL_MAX,
    );
  }

  getRandomNumber(min, max) {
    const val = this.rng();
    return Math.floor(val * (max - min + 1) + min);
  }

  createCactus() {
    const index = this.getRandomNumber(0, this.cactiImages.length - 1);
    const cactusImage = this.cactiImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.canvas.height - cactusImage.height;

    const cactus = new Cactus(
      this.ctx,
      x,
      y,
      cactusImage.width,
      cactusImage.height,
      cactusImage.image,
    );

    this.cacti.push(cactus);
  }

  update(gameSpeed, deltaTime) {
    if (this.nextCactusInterval <= 0) {
      this.createCactus();
      this.setNextCactusTime();
    }

    this.nextCactusInterval -= deltaTime;

    this.cacti.forEach((cactus) => {
      cactus.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.cacti = this.cacti.filter((cactus) => cactus.x > -cactus.width);
  }

  draw() {
    this.cacti.forEach((cactus) => cactus.draw());
  }

  collideWith(sprite) {
    return this.cacti.some((cactus) => cactus.collideWith(sprite));
  }

  reset() {
    this.cacti = [];
  }

  getClosestCactus() {
    return this.cacti.reduce((closest, cactus) => {
      if (!closest || (cactus.x < closest.x && cactus.x > 0)) {
        return cactus;
      }
      return closest;
    }, null);
  }
}

export default CactiController;
