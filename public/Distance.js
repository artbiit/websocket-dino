import gameManager from './GameManager.js';

class Distance {
  distance = 0;

  set(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.distance += deltaTime * 0.001 * gameManager.getGameSpeed();
    gameManager.setHighDistance(this.distance);
  }

  reset() {
    this.distance = 0;
  }

  getScore() {
    return this.distance;
  }

  draw() {
    const highDistance = gameManager.getHighDistance();
    const y = 44 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const distanceX = this.canvas.width - 75 * this.scaleRatio;
    const highDistanceX = distanceX - 125 * this.scaleRatio;

    const distancePadded = Math.floor(this.distance).toString().padStart(6, 0);
    const highDistancePadded = Math.floor(highDistance).toString().padStart(6, 0);

    this.ctx.fillText(distancePadded, distanceX, y);
    this.ctx.fillText(`D ${highDistancePadded}`, highDistanceX, y);
  }
}

const distance = new Distance();
export default distance;
