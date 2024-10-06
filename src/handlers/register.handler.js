import { addUser, getUser, userExists } from '../models/user.model.js';
import { v4 } from 'uuid';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js';
import { CLIENT_VERSION } from '../constants.js';

const registerHandler = async (io) => {
  io.on('connection', async (socket) => {
    if (!CLIENT_VERSION.includes(socket.handshake.query.clientVersion)) {
      socket.emit('version_mismatch', { status: 'fail', message: 'Client version mismatch' });
      socket.disconnect(true);
      return;
    }

    let userUUID = socket.handshake.query.uuid;
    const isExits = userUUID !== 'null' && (await userExists(userUUID));
    if (!isExits) {
      userUUID = v4();
    }
    await addUser(userUUID, socket.id);
    await handleConnection(socket, userUUID);

    socket.on('event', (data) => handlerEvent(io, socket, data));
    socket.on('disconnect', (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
