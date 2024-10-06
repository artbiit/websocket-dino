import { CLIENT_VERSION } from '../constants.js';
import { getGameAssets } from '../init/assets.js';
import { getFirstPlace } from '../models/scoreborad.model.js';
import { createStage, setStage } from '../models/stage.model.js';
import { getUser, removeUser, userCount } from '../models/user.model.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = async (socket, uuid) => {
  await removeUser(uuid);
  console.log(`User disconnected : ${uuid} / userCount : ${await userCount()}`);
};

export const handleConnection = async (socket, uuid) => {
  console.log(`New user connected : ${uuid} with socket ID: ${socket.id}`);

  createStage(uuid);
  const { stages, items, itemUnlocks } = getGameAssets();
  setStage(uuid, stages.data[0].id);
  const user = await getUser(uuid);
  let rankUser = await getFirstPlace();
  if (rankUser != null && rankUser.length > 0) {
    rankUser = await getUser(rankUser[0]);
    rankUser.socketId = undefined;
    rankUser.lastLogin = undefined;
    rankUser.createAt = undefined;
  }
  user.socketId = undefined;
  socket.emit('connection', {
    uuid,
    user,
    stages: stages.data,
    items: items.data,
    itemUnlocks: itemUnlocks.data,
    rankUser,
  });
};

export const handlerEvent = async (io, socket, data) => {
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  const response = await handler(data.userId, data.payload);

  const broadcast = response.broadcast;
  response.broadcast = undefined;

  const event = response.event || 'response';
  response.event = undefined;

  if (broadcast) {
    io.emit(broadcast.event, broadcast.data);
  } else {
    socket.emit(event, response);
  }
  console.log(`handler. br[${broadcast}] ${event} - ${JSON.stringify(response)}`);
};

export const isValidScore = (stage, score) => {
  return score <= getValidScore(stage);
};

export const getValidScore = (stage) => {
  let { stages, items, itemUnlocks } = getGameAssets();
  stages = stages.data;
  items = items.data;
  itemUnlocks = itemUnlocks.data;
  const stageInfo = stages.find((s) => s.id === stage);
  if (!stageInfo) {
    throw new Error('Invalid stage ID');
  }

  const unlockedItems = itemUnlocks
    .filter((unlock) => unlock.stage_id === stage)
    .map((unlock) => items.find((item) => item.id === unlock.item_id));

  const maxItemScore = unlockedItems.reduce((max, item) => Math.max(max, item.score), 0);

  const maxItems = stageInfo.elapsed;
  const baseScore = stageInfo.elapsed;
  const maxPossibleScore = baseScore + maxItems * maxItemScore + stageInfo.gameSpeed; //게임 속도 sec만큼 여유분 추가
  return maxPossibleScore;
};
