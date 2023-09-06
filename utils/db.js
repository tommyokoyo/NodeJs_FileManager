const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || '192.168.184.131';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const DB_URL = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(DB_URL, { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) {
        console.log('MongoDB connection error:', err);
      } else {
        console.log('MongoDB connection established');
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const userCollection = this.client.db().collection('users');
    return userCollection.countDocuments();
  }

  async nbFiles() {
    const filesCollection = this.client.db().collection('files');
    return filesCollection.countDocuments();
  }

  async userCollections() {
    return this.client.db().collection('users');
  }

  async fileCollections() {
    return this.client.db().collection('files');
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
