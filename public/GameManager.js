import { requestNextStage } from './Socket.js';

class GameManager {
  #uuid = null;
  #currentState = 0;
  #seedrandom = null;
  #gameSpeed = 1.0;
  #state = {
    prev_init: 0,
    connection: 1,
    disconnect: 2,
    version_mismatch: 3,
    connected: 10,
    stage_request: 11,
    stage_setup: 12,
    stage: 13,
    game_over: 14,
  };
  #stages = null;
  #items = null;
  #itemUnlocks = null;
  #currentStage = null;
  #lastStage = null;
  #currentStageIndex = 0;

  #highScore = 0;
  #highDistance = 0;
  #rankUser = null;

  constructor() {
    Object.freeze(this.#state);
    this.#seedrandom = new Math.seedrandom(0);
  }

  setRankUser = (rankUser) => {
    rankUser.highScore = Number(rankUser.highScore);
    if (Number.isNaN(rankUser.highScore)) {
      rankUser.highScore = 0;
    }
    rankUser.highDistance = Number(rankUser.highDistance);
    if (Number.isNaN(rankUser.highDistance)) {
      rankUser.highDistance = 0;
    }

    this.#rankUser = rankUser;
  };

  getRankUserDistance = () => {
    return this.#rankUser?.highDistance || 0;
  };

  getRankUser = () => {
    return this.#rankUser;
  };
  setHighScore = (score) => {
    this.#highScore = Math.max(score, this.#highScore);
  };

  getHighScore = () => {
    return this.#highScore;
  };

  setHighDistance = (distance) => {
    this.#highDistance = Math.max(distance, this.#highDistance);
  };

  getHighDistance = () => {
    return this.#highDistance;
  };

  getUUID = () => {
    return this.#uuid;
  };
  setUUID = (uuid) => {
    this.#uuid = uuid;
  };

  getState = () => {
    return this.#currentState;
  };

  setState = (state) => {
    this.#currentState = state;
  };

  /**
   * prev_init : 앱이 실행된 직후
   * connection : 서버에 연결 시도중
   * disconnect : 서버에서 연결 끊김
   * version_mismatch : 서버 호환 버전과 맞지 않음
   * stage_request : 서버로 현 스테이지 무엇인지 물어보는 중 (조작만 가능)
   * stage_setup : 스테이지 설정중 (조작만 가능),
   * stage : 스테이지 진행 중
   */
  getStates = () => {
    return this.#state;
  };

  setCurrentStage = (stageId) => {
    const stage = this.#stages[stageId];
    if (stage) {
      this.#currentStageIndex = Object.keys(this.#stages).indexOf(String(stageId));
      this.#currentStage = stageId;
      this.setGameSpeed(stage.gameSpeed);
      this.createRng(stage.seed);
      this.setState(this.#state.stage_setup);
    } else {
      throw new Error(`Stage: ${stageId} not found`);
    }
  };

  getCurrentStage = () => {
    return this.#currentStage;
  };

  getCurrentStageIndex = () => {
    return this.#currentStageIndex;
  };

  createRng = (seed) => {
    this.#seedrandom = new Math.seedrandom(seed);
  };

  getStages = () => {
    return this.#stages;
  };

  setStages = (stages) => {
    const stagesMap = Object.fromEntries(
      new Map(
        stages.map((stage) => [
          `${stage.id}`,
          {
            elapsed: stage.elapsed,
            seed: stage.seed,
            gameSpeed: stage.gameSpeed,
          },
        ]),
      ).entries(),
    );
    this.#stages = stagesMap;
    const stageKeys = Object.keys(this.#stages);
    this.#lastStage = stageKeys[stageKeys.length - 1];
  };

  getItems = () => {
    return this.#items;
  };

  setItems = (items) => {
    items = Object.fromEntries(
      new Map(items.map((item) => [`${item.id}`, { score: item.score }])).entries(),
    );
    this.#items = items;
  };

  getItemUnlocks = () => {
    return this.#itemUnlocks;
  };

  setItemUnlocks = (itemUnlocks) => {
    itemUnlocks = Object.fromEntries(
      new Map(
        itemUnlocks.map((unlock) => [
          `${unlock.stage_id}`,
          { unlockId: unlock.id, itemId: unlock.item_id },
        ]),
      ).entries(),
    );

    this.#itemUnlocks = itemUnlocks;
  };

  getGameSpeed = () => {
    return this.#gameSpeed;
  };

  setGameSpeed = (gameSpeed) => {
    this.#gameSpeed = gameSpeed;
  };
  rng = () => {
    return this.#seedrandom();
  };

  checkElapsed = (elapsedTime) => {
    if (this.#lastStage == this.#currentStage) {
      return;
    }
    if (this.#stages[this.#currentStage].elapsed <= elapsedTime) {
      requestNextStage();
    }
  };
}

const gameManager = new GameManager();
export default gameManager;
