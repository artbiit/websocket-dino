import gameManager from './GameManager.js';

class Score {
  score = 0;

  set(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001;
    gameManager.setHighScore(this.score);
  }

  getItem(itemId) {
    const item = gameManager.getItems()[itemId];
    if (item) {
      this.score += item.score;
    } else {
      console.error(`item:${itemId} not found`);
    }
  }

  reset() {
    this.score = 0;
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = gameManager.getHighScore();
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = Math.floor(highScore).toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`S ${highScorePadded}`, highScoreX, y);
  }
}

const score = new Score();
export default score;
