import { CLIENT_VERSION } from './Constants.js';
import handlers from './handlers/handlerMapping.js';
import GameManager from './GameManager.js';
import { getLocalStorage } from './LocalStorage.js';
import Score from './Score.js';
import Distance from './Distance.js';
import player from './Player.js';
let socket = null;

export const connect = () => {
  const states = GameManager.getStates();
  GameManager.setState(states.connection);
  socket = io('http://positivenerd.duckdns.org:15010/', {
    query: {
      clientVersion: CLIENT_VERSION,
      uuid: getLocalStorage('UUID'),
    },
  });

  handlers.forEach((handler) => {
    socket.on(handler.event, (data) => {
      console.log(`rcv : ${handler.event} => ${JSON.stringify(data)}`);
      handler.action(data);
    });
  });
};

export const sendEvent = (handlerId, payload) => {
  socket.emit('event', {
    userId: GameManager.getUUID(),
    handlerId,
    payload,
  });
};

export const requestGameStart = () => {
  const states = GameManager.getStates();
  GameManager.setState(states.stage_request);
  sendEvent(2, {});
};

export const requestGameEnd = () => {
  const states = GameManager.getStates();
  GameManager.setState(states.game_over);
  sendEvent(3, {
    currentStage: GameManager.getCurrentStage(),
    currentScore: Score.score,
    currentDistance: Distance.distance,
  });
};

export const requestNextStage = () => {
  const states = GameManager.getStates();
  GameManager.setState(states.stage_request);
  sendEvent(11, {
    currentStage: GameManager.getCurrentStage(),
    currentScore: Score.score,
  });
};
