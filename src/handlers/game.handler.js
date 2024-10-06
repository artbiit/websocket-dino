import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';
import { getValidScore } from './helper.js';
import { getFirstPlace, updateScoreAndDetectFirstPlaceChange } from '../models/scoreborad.model.js';
import { getUser, updateHiDistance, updateHiScore } from '../models/user.model.js';
export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  const currentTime = new Date().toISOString();
  clearStage(uuid);
  setStage(uuid, stages.data[0].id, currentTime);

  return {
    event: 'stageResponse',
    status: 'success',
    timestamp: currentTime,
    stageId: stages.data[0].id,
  };
};

export const gameEnd = async (uuid, payload) => {
  const { currentStage, currentScore, currentDistance } = payload;
  const event = 'gameEnd';
  let status = 'success';
  let message = undefined;
  let stage = await getStage(uuid);
  let maxScore = 0;
  let broadcast = undefined;
  let { stages } = getGameAssets();
  stages = stages.data;
  stages.forEach((stage, index) => {
    maxScore += getValidScore(stage.id);
  });
  if (!stage) {
    status = 'fail';
    message = 'No stages found for user';
  } else if (stage.id !== currentStage) {
    status = 'fail';
    message = 'Current Stage mismatch';
  } else if (maxScore < currentScore) {
    status = 'fail';
    message = 'Impossible score.';
  } else {
    const [updatedRank, updatedHiScore, updatedHiDistance] = await Promise.all([
      updateScoreAndDetectFirstPlaceChange(uuid, currentScore),
      updateHiScore(uuid, currentScore),
      updateHiDistance(uuid, currentDistance),
    ]);

    if (updatedRank) {
      let firsUser = await getUser(updatedRank);
      firsUser.socketId = undefined;
      firsUser.uuid = undefined;
      broadcast = {
        event: 'updatedRank',
        data: { firsUser },
      };
    }
  }

  clearStage(uuid);

  return { status: 'success', message: 'Game ended', broadcast };
};
