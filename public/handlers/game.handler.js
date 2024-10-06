import gameManager from '../GameManager.js';

export const stageSetup = (data) => {
  const stageId = data.stageId;
  gameManager.setCurrentStage(stageId);
};

export const moveStage = (data) => {
  const stageId = data.stageId;
  gameManager.setCurrentStage(stageId);
};

export const updatedRank = (data) => {
  gameManager.setRankUser({
    highScore: data.firsUser.highScore,
    highDistance: data.firsUser.highDistance,
  });
};
