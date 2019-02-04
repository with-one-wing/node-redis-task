const redis = require('redis');
const {promisify} = require('util');
const client = redis.createClient(process.env.REDIS_URL);
const subscriber = redis.createClient(process.env.REDIS_URL);
const publisher = redis.createClient(process.env.REDIS_URL);

module.exports = {
  ...client,
  subscriber,
  publisher,
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  hgetall: promisify(client.hgetall).bind(client),
  hset: promisify(client.hset).bind(client),
  hget: promisify(client.hget).bind(client),
  hmset: promisify(client.hmset).bind(client),
  hdel: promisify(client.hdel).bind(client),
};
