import GameManager from './GameManager.js';
import Item from './Item.js';

class ItemController {
  INTERVAL_MIN = 1000;
  INTERVAL_MAX = 12000;

  nextInterval = null;
  items = [];
  unlockedItems = new Set();

  constructor(ctx, itemImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextItemTime();
  }

  setNextItemTime() {
    this.nextInterval = this.getRandomNumber(this.INTERVAL_MIN, this.INTERVAL_MAX);
  }

  getRandomNumber(min, max) {
    return Math.floor(GameManager.rng() * (max - min + 1) + min);
  }

  createItem() {
    if (this.unlockedItems.size === 0) {
      return;
    }
    const index = this.getRandomNumber(0, this.unlockedItems.size - 1);
    const itemInfo = this.itemImages[index];
    if (itemInfo) {
      const x = this.canvas.width * 1.5;
      const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

      const item = new Item(
        this.ctx,
        itemInfo.id,
        x,
        y,
        itemInfo.width,
        itemInfo.height,
        itemInfo.image,
      );

      this.items.push(item);
    }

    this.setNextItemTime();
  }

  unlockItem(stageId) {
    const unlockInfo = GameManager.getItemUnlocks();
    if (unlockInfo && unlockInfo[stageId]) {
      this.unlockedItems.add(unlockInfo[stageId].itemId);
    }
  }

  update(gameSpeed, deltaTime) {
    if (this.nextInterval <= 0) {
      this.createItem();
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(collidedItem.x, collidedItem.y, collidedItem.width, collidedItem.height);
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.setNextItemTime();
    this.unlockedItems.clear();
    this.items = [];
  }
}

export default ItemController;
