import redis from '../redis/redis.manager.js';

export const createStage = async (uuid) => {
  await redis.del(`stages:${uuid}`);
};

export const getStage = async (uuid) => {
  const stage = await redis.get(`stages:${uuid}`);

  return JSON.parse(stage);
};

export const setStage = async (uuid, id, timestamp) => {
  const stage = { id, timestamp };
  await redis.set(`stages:${uuid}`, JSON.stringify(stage));
};

export const clearStage = async (uuid) => {
  await redis.del(`stages:${uuid}`);
};
