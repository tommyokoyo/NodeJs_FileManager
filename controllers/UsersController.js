const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user = await (await dbClient.userCollections()).findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exists' });
    }

    const sha1Password = sha1(password);

    const newUser = {
      email,
      password: sha1Password,
    };

    try {
      const result = await (await dbClient.userCollections()).insertOne(newUser);
      const createdUser = {
        id: result.insertedId.toString(),
        email: result.ops[0].email,
      };
      return res.status(201).json(createdUser);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    const { 'x-token': token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No Token' });
    }

    const key = `auth_${token}`;

    try {
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await (await dbClient.userCollections()).findOne({ _id: ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal Server Error - error' });
    }
  }
}

module.exports = UsersController;
