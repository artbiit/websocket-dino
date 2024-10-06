import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import redisServiceManager from './redis/redis.manager.js';

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
await redisServiceManager.connect();
await initSocket(server);

server.listen(PORT, async () => {
  console.log(`Server is running on port : ${PORT}`);

  try {
    const assets = await loadGameAssets();
    console.log(`Assets loaded success `);
  } catch (e) {
    console.error(`Assets loaded failed : ${e}`);
  }
});
