const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const YAML = require('yamljs');

const redis = require('./redis');
const {validator, getCurrentTimestamp, getTimeout} = require('./utils');
const swaggerDocument = YAML.load('./swagger.yaml');

const CHANNEL_NAME = 'time_message_channel';
const COLLECTION_NAME = 'time_message1';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public/swagger-ui.html', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const processMessage = async (timestamp) => {
  const message = await redis.hget(COLLECTION_NAME, timestamp);
  if (!message) {
    return;
  }
  deleteAndPrintMessage(message, timestamp);
};

const deleteAndPrintMessage = (message, timestamp) => {
  console.log( `We got message: ${message} at timestamp ${timestamp}`);
  redis.hdel(COLLECTION_NAME, timestamp);
};

const processUnreadRecords = async () => {
  const unreadRecords = await redis.hgetall(COLLECTION_NAME);
  if (!unreadRecords) {
    console.log('NOT UNREAD RECORDS');
    return;
  }

  for (const timestamp in unreadRecords) {
    if (!unreadRecords.hasOwnProperty(timestamp)) {
      continue;
    }
    const message = unreadRecords[timestamp];
    if (timestamp > getCurrentTimestamp()) {
      setTimeout(() => {
        processMessage(timestamp, 0);
      }, getTimeout(timestamp));
    } else {
      deleteAndPrintMessage(message, timestamp);
    }
  }
};

processUnreadRecords();
redis.subscriber.subscribe(CHANNEL_NAME);
redis.subscriber.on('message', function(channel, messageData) {
  const message = JSON.parse(messageData);
  const timeout = getTimeout(message.timestamp);
  setTimeout(() => {
    processMessage(message.timestamp, timeout);
  }, timeout);
});


app.post('/api/v1/echoAtTime', validator, async (request, response, next) => {
  const {timestamp, message} = request.body;

  try {
    await redis.hset(COLLECTION_NAME, timestamp, message);
    if (!isSet) {
      throw new errors.HttpStatusError(400, 'Insert error or you are trying to duplicate time.');
    }
    const messageData = JSON.stringify({timestamp, message});
    redis.publisher.publish(CHANNEL_NAME, messageData);
    response.status(201).json({
      ok: true,
    });
  } catch (err) {
    next(err);
  }
});


app.use((error, req, res, next) => {
  console.log('error', error);
  res.status(error.status);
  res.json({
    ok: false,
    error: error.message,
  });
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`)
);
