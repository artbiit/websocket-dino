import redis from '../redis/redis.manager.js';
import { getUser } from './user.model.js';

export const updateScoreAndDetectFirstPlaceChange = async (uuid, score) => {
  const user = await getUser(uuid);

  if (user.highScore >= score) {
    return;
  }
  const previousFirstPlace = await getFirstPlace();
  const previousFirstPlaceScore = Number(previousFirstPlace[1]) || 0;
  console.log('previousFirstPlaceScore ', previousFirstPlaceScore);
  await addOrUpdatePlayerScore(uuid, Number(score));
  const currentFirstPlace = await getFirstPlace();
  const currentFirstPlaceScore = Number(currentFirstPlace[1]) || 0;
  console.log('currentFirstPlaceScore ', currentFirstPlaceScore);
  if (previousFirstPlaceScore < currentFirstPlaceScore) {
    console.log(`1등의 점수가 변경되었습니다! 새로운 1등의 점수: ${currentFirstPlaceScore}`);
    return currentFirstPlace[0]; // 1등의 점수가 변경됨
  }

  return false; // 1등의 점수가 변경되지 않음
};

export const getFirstPlace = async () => {
  const result = await redis.zRange('leaderboard', 0, 0, {
    REV: true,
    WITHSCORES: true,
  });
  return result.length > 0 ? result : [];
};
export const addOrUpdatePlayerScore = async (uuid, score) => {
  await redis.zAdd('leaderboard', score, uuid);
};
