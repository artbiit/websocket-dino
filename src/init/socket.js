import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';

const initSocket = async (server) => {
  const io = new SocketIO();
  io.attach(server);

  await registerHandler(io);
};

export default initSocket;
