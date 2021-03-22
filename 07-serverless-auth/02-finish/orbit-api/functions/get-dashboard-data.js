const data = require('../data/dashboard');
const { checkAuth } = require('../util');
exports.handler = async function (
  event,
  context,
  callback
) {
  try {
    await checkAuth(event);
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(data)
    });
  } catch (err) {
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({
        error: err
      })
    });
  }
};
