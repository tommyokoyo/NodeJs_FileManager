const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const storagePath = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async files(req, res) {
    const { 'x-token': token } = req.headers;
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;

    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await (await dbClient.fileCollections())
        .findOne({ _id: ObjectId(parentId) });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }

      const fileDocument = {
        userId,
        name,
        type,
        isPublic,
        parentId,
      };

      try {
        if (type === 'folder') {
          const file = await (await dbClient.fileCollections()).insertOne(fileDocument);

          const newFile = {
            id: file.insertedId.toString(),
            userId: file.ops[0].userId,
            name: file.ops[0].name,
            type: file.ops[0].type,
            isPublic: file.ops[0].isPublic,
            parentId: file.ops[0].parentId,
          };
          return res.status(201).json(file);
        }
        const fileuuid = uuidv4();
        const filePath = path.join(storagePath, `${fileuuid}`);

        const decodedData = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, decodedData);

        fileDocument.localPath = filePath;

        const result = await (await dbClient.fileCollections()).insertOne(fileDocument);

        const newFile = {
          id: result.insertedId.toString(),
          userId: result.ops[0].userId,
          name: result.ops[0].name,
          type: result.ops[0].type,
          isPublic: result.ops[0].isPublic,
          parentId: result.ops[0].parentId,
        };
        return res.status(201).json(newFile);
      } catch (error) {
        console.error('Error creating file: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    const newDocument = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    try {
      if (type === 'folder') {
        const result = await (await dbClient.fileCollections()).insertOne(newDocument);

        const newFile = {
          id: result.insertedId.toString(),
          userId: result.ops[0].userId,
          name: result.ops[0].name,
          type: result.ops[0].type,
          isPublic: result.ops[0].isPublic,
          parentId: result.ops[0].parentId,
        };
        return res.status(201).json(newFile);
      }
      const fileuuid = uuidv4();
      const filePath = path.join(storagePath, `${fileuuid}`);

      const decodedData = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, decodedData);

      newDocument.localPath = filePath;

      const file = await (await dbClient.fileCollections()).insertOne(newDocument);

      const newFile = {
        id: file.insertedId.toString(),
        userId: file.ops[0].userId,
        name: file.ops[0].name,
        type: file.ops[0].type,
        isPublic: file.ops[0].isPublic,
        parentId: file.ops[0].parentId,
      };
      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error creating file: ', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
