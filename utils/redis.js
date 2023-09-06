const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.connected = true;
    this.client.on('error', (error) => {
      console.error('Redis connection error', error);
      this.client.connected = false;
    });
    this.client.on('connect', () => {
      this.client.connected = true;
      // console.log('redis connected');
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, durationInSeconds) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, durationInSeconds, value, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response > 0);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
