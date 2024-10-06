import gameManager from './GameManager.js';

class RankInfo {
  set(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  draw() {
    const rankUser = gameManager.getRankUser();
    let highScore = 0;
    let highDistance = 0;
    if (rankUser) {
      highScore = rankUser.highScore;
      highDistance = rankUser.highDistance;
    }

    let y = 12 * this.scaleRatio;

    const fontSize = 10 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#FF2e2e';

    const scoreX = this.canvas.width - 790 * this.scaleRatio;
    const scorePadded = Math.floor(highScore).toString().padStart(6, 0);

    const distancePadded = Math.floor(highDistance).toString().padStart(6, 0);
    this.ctx.fillText(`1st score : ${scorePadded} : distance ${distancePadded}`, scoreX, y);
  }
}

const rankInfo = new RankInfo();
export default rankInfo;
