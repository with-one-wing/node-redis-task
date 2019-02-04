const errors = require('common-errors');

const validator = (req, res, next) => {
  const timestamp = +req.body.timestamp;

  if (timestamp < getCurrentTimestamp()) {
    return next(new errors.HttpStatusError(400, 'Timestamp is expired. Please pass timestamp in future.'));
  }

  next();
};

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const getTimeout = (timestamp) => (timestamp - getCurrentTimestamp()) * 1000;


module.exports = {validator, getCurrentTimestamp, getTimeout};
