import redis from '../redis/redis.manager.js';

// 유저 추가 시 Redis에 저장
export const addUser = async (uuid, socketId) => {
  const currentTime = new Date().toISOString();

  // 유저가 처음 로그인하는 경우
  const isExists = await getUser(uuid);

  if (!isExists || !isExists.createdAt) {
    await redis.hSet(`user:${uuid}`, {
      socketId: socketId,
      createdAt: currentTime,
      lastLogin: currentTime,
      highScore: 0,
      highDistance: 0,
    });
  } else {
    let request = [];
    request.push(redis.hSet(`user:${uuid}`, 'lastLogin', currentTime));
    request.push(redis.hSet(`user:${uuid}`, 'socketId', socketId));
    await Promise.all(request);
  }
};

export const updateHiScore = async (uuid, highScore) => {
  const currentHiScore = await redis.hGet(`user:${uuid}`, 'highScore');

  if (currentHiScore === null || highScore > parseInt(currentHiScore)) {
    await redis.hSet(`user:${uuid}`, 'highScore', highScore);
    console.log(`${uuid}의 새로운 최고 점수: ${highScore}`);
    return true;
  }

  return false;
};

export const updateHiDistance = async (uuid, highDistance) => {
  const currentHiDistance = await redis.hGet(`user:${uuid}`, 'highDistance');

  if (currentHiDistance === null || highDistance > parseInt(currentHiDistance)) {
    await redis.hSet(`user:${uuid}`, 'highDistance', highDistance);
    console.log(`${uuid}의 새로운 최고 거리: ${highDistance}`);
    return true;
  }

  return false;
};

export const getUser = async (uuid) => {
  const user = await redis.hGetAll(`user:${uuid}`);
  return Object.keys(user).length > 0 ? { ...user } : null;
};

export const userCount = async () => {
  const keys = await redis.keys('user:*');
  let count = 0;

  for (const key of keys) {
    const socketId = await redis.hGet(key, 'socketId');
    if (socketId !== null && socketId !== 'null') {
      count++;
    }
  }

  return count;
};

export const removeUser = async (uuid) => {
  await redis.hSet(`user:${uuid}`, 'socketId', 'null');
};

export const userExists = async (uuid) => {
  return await redis.exists(`user:${uuid}`);
};
