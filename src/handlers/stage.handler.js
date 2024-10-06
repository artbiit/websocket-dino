import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';
import { isValidScore } from './helper.js';
export const moveStageHandler = async (userId, payload) => {
  const event = 'moveStage';
  const currentScore = payload.currentScore;
  let currentStage = await getStage(userId);
  let status = 'success';
  let message = undefined;
  let nextStage = null;
  if (!currentStage) {
    status = 'fail';
    message = 'No stages found for user';
  } else if (currentStage.id !== payload.currentStage) {
    status = 'fail';
    message = 'Current Stage mismatch';
  } else if (!isValidScore(currentStage.id, currentScore)) {
    status = 'fail';
    message = 'Impossible score.';
  } else {
    const serverTime = Date.now();
    const elapsedTime = (serverTime - currentStage.timestamp) / 1000;
    const { stages } = getGameAssets();
    const index = stages.data.findIndex((item) => item.id === currentStage.id);
    nextStage = stages.data[index + 1];
    if (index === -1) {
      status = 'fail';
      message = 'No stages found';
    } else if (stages.data.length <= index + 1) {
      nextStage = stages.data[stages.data.length - 1];
    } else if (nextStage.elapsed + 1.0 <= elapsedTime) {
      status = 'fail';
      message = 'Invalid elapsedTime';
    } else {
      setStage(userId, nextStage.id, serverTime);
    }
  }

  return { event, status, message, stageId: nextStage?.id || -1 };
};
