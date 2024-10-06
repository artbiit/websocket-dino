import player from './Player.js';
import Ground from './Ground.js';
import CactiController from './CactiController.js';
import score from './Score.js';
import ItemController from './ItemController.js';
import { connect, requestGameEnd, requestGameStart } from './Socket.js';
import GameManager from './GameManager.js';
import distance from './Distance.js';
import rankInfo from './RankInfo.js';
import Ghost from './Ghost.js';

const states = GameManager.getStates();
console.clear();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// 게임 크기
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;

// 플레이어
// 800 * 200 사이즈의 캔버스에서는 이미지의 기본크기가 크기때문에 1.5로 나눈 값을 사용. (비율 유지)
const PLAYER_WIDTH = 88 / 1.5; // 58
const PLAYER_HEIGHT = 94 / 1.5; // 62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;

// 땅
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_SPEED = 0.5;

// 선인장
const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: 'images/cactus_1.png' },
  { width: 98 / 1.5, height: 100 / 1.5, image: 'images/cactus_2.png' },
  { width: 68 / 1.5, height: 70 / 1.5, image: 'images/cactus_3.png' },
];

// 아이템
const ITEM_CONFIG = [
  { width: 50 / 1.5, height: 50 / 1.5, id: 1, image: 'images/items/pokeball_red.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 2, image: 'images/items/pokeball_yellow.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 3, image: 'images/items/pokeball_purple.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 4, image: 'images/items/pokeball_cyan.png' },
];

// 게임 요소들
let ground = null;
let cactiController = null;
let itemController = null;
let ghost = null;

let scaleRatio = null;
let previousTime = null;
let gameover = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;
let elapsedTime = 0.0;
let stageStartTime = 0;

function createSprites() {
  // 비율에 맞는 크기
  // 유저
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  // 땅
  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player.set(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
  );

  ghost = new Ghost(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
  );
  ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_SPEED, scaleRatio);

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_SPEED);

  const itemImages = ITEM_CONFIG.map((item) => {
    const image = new Image();
    image.src = item.image;
    return {
      image,
      id: item.id,
      width: item.width * scaleRatio,
      height: item.height * scaleRatio,
    };
  });

  itemController = new ItemController(ctx, itemImages, scaleRatio, GROUND_SPEED);

  score.set(ctx, scaleRatio);
  distance.set(ctx, scaleRatio);
  rankInfo.set(ctx, scaleRatio);
}

function getScaleRatio() {
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
  const screenWidth = Math.min(window.innerHeight, document.documentElement.clientWidth);

  // window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
window.addEventListener('resize', setScreen);

if (screen.orientation) {
  screen.orientation.addEventListener('change', setScreen);
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText('GAME OVER', x, y);
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText('Tap Screen or Press Space To Start', x, y);
}

function showWaitForConnectionText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText('Wait for server connection...', x, y);
}

function showVersionMismatchText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText('Version miss match', x, y);
}

function reset() {
  window.removeEventListener('keyup', handleKeyUp);
  hasAddedEventListenersForRestart = false;
  gameover = false;
  waitingToStart = false;
  requestGameStart();
  ground.reset();
  cactiController.reset();
  score.reset();
  distance.reset();
  itemController.reset();
  player.startRecording();
  const rankUser = GameManager.getRankUser();
  if (rankUser) {
    ghost.startGhost(rankUser.highDistance);
  }
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener('keyup', reset, { once: true });
    }, 1000);
  }
}

function showStageText() {
  const y = 20 * scaleRatio;

  const fontSize = 20 * scaleRatio;
  ctx.font = `${fontSize}px serif`;
  ctx.fillStyle = '#525250';

  const x = ctx.canvas.width - 450 * scaleRatio;

  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';

  ctx.fillText(`Stage : ${GameManager.getCurrentStageIndex() + 1}`, x, y);
}

function clearScreen() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  // 모든 환경에서 같은 게임 속도를 유지하기 위해 구하는 값
  // 프레임 렌더링 속도
  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();
  const currentState = GameManager.getState();
  const gameSpeed = GameManager.getGameSpeed();
  if (currentState < states.connected) {
    if (currentState == states.prev_init) {
      connect();
    } else if (currentState == states.connection) {
      showWaitForConnectionText();
    } else if (currentState == states.version_mismatch) {
      showVersionMismatchText();
    }
  } else if (gameover) {
    showGameOver();
  } else if (waitingToStart) {
    showStartGameText();
  } else {
    // 달리기
    player.update(gameSpeed, deltaTime);

    if (currentState === states.stage_setup) {
      stageStartTime = Date.now();
      itemController.unlockItem(GameManager.getCurrentStage());
      GameManager.setState(states.stage);
    }

    if (currentState === states.stage) {
      elapsedTime = (Date.now() - stageStartTime) / 1000;

      // update
      // 땅이 움직임
      ground.update(gameSpeed, deltaTime);
      // 선인장
      cactiController.update(gameSpeed, deltaTime);
      itemController.update(gameSpeed, deltaTime);
      score.update(deltaTime);
      distance.update(deltaTime);
      if (ghost.playing) {
        ghost.checkAndJump(cactiController, gameSpeed, deltaTime);
      }

      if (!gameover && cactiController.collideWith(player)) {
        requestGameEnd();
        gameover = true;
        setupGameReset();
        player.stopRecording();
      }

      const collideWithItem = itemController.collideWith(player);
      if (collideWithItem && collideWithItem.itemId) {
        score.getItem(collideWithItem.itemId);
      }

      GameManager.checkElapsed(elapsedTime);
    }
  }

  // draw

  player.draw();
  cactiController.draw();
  ground.draw();
  score.draw();
  itemController.draw();
  distance.draw();
  rankInfo.draw();
  if (ghost.playing) {
    ghost.draw();
  }
  showStageText();
  // 재귀 호출 (무한반복)
  requestAnimationFrame(gameLoop);
}

// 게임 프레임을 다시 그리는 메서드
requestAnimationFrame(gameLoop);

const handleKeyUp = (event) => {
  if (event.code === 'Space') {
    reset();
  }
};

window.addEventListener('keyup', handleKeyUp);
