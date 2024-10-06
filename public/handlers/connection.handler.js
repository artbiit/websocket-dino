import GameManager from '../GameManager.js';
import { setLocalStorage } from '../LocalStorage.js';

export const connectHandler = (data) => {
  setLocalStorage('UUID', data.uuid);
  const states = GameManager.getStates();
  GameManager.setUUID(data.uuid);
  GameManager.setHighDistance(data.user.highDistance);
  GameManager.setHighScore(data.user.highScore);
  GameManager.setState(states.connected);
  GameManager.setStages(data.stages);
  GameManager.setItemUnlocks(data.itemUnlocks);
  GameManager.setItems(data.items);
  GameManager.setRankUser(data.rankUser);
};

export const disconnectHandler = (data) => {
  const states = GameManager.getStates();
  GameManager.setUUID(null);
  GameManager.setState(states.disconnect);
};

export const versionMismatchHandler = (data) => {
  const states = GameManager.getStates();
  GameManager.setUUID(null);
  GameManager.setState(states.version_mismatch);
};
