const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    const redisIsAlive = redisClient.isAlive();
    const dbIsAlive = dbClient.isAlive();

    const status = {
      redis: redisIsAlive,
      db: dbIsAlive,
    };

    const statusCode = redisIsAlive && dbIsAlive ? 200 : 500;

    return res.status(statusCode).json(status);
  }

  static async getStats(req, res) {
    try {
      const numOfUsers = await dbClient.nbUsers();
      const numOFiles = await dbClient.nbFiles();

      const stats = {
        users: numOfUsers,
        files: numOFiles,
      };
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
