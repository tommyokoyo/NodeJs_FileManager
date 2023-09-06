This project is a summarizes: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

The objective is to build a simple platform to upload and view files:

    User authentication via a token
    List all files
    Upload a new file
    Change permission of a file
    View a file
    Generate thumbnails for images

Of course, this kind of service already exists in the real life - it’s a learning purpose to assemble each piece and build a full product.

Inside the folder utils, there is:
- file redis.js that contains the class RedisClient.


- db.js that contains the class DBClient.

Inside server.js, exists the Express server.

Inside the folder routes, there is a file index.js that contains all endpoints of our API.

Inside the folder controllers, there contains the endpoint methods.
