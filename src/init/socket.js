import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';

const initSocket = async (server) => {
  const io = new SocketIO(server, {
    cors: {
      origin: 'http://sparta.positivenerd.duckdns.org',
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });

  await registerHandler(io);
};

export default initSocket;
