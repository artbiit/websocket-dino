import { connectHandler, disconnectHandler, versionMismatchHandler } from './connection.handler.js';
import { stageSetup, moveStage, updatedRank } from './game.handler.js';
const handlers = [
  {
    event: 'connection',
    action: connectHandler,
  },
  //   {
  //     event: 'disconnect',
  //     action: disconnectHandler,
  //   },
  {
    event: 'version_mismatch',
    action: versionMismatchHandler,
  },
  {
    event: 'stageResponse',
    action: stageSetup,
  },
  {
    event: 'moveStage',
    action: moveStage,
  },
  {
    event: 'updatedRank',
    action: updatedRank,
  },
];

export default handlers;
