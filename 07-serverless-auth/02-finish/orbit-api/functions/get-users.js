const UserConnection = require('../data/UserConnection');
const { checkAuth, checkRole } = require('../util');

exports.handler = async function (
  event,
  context,
  callback
) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const user = await checkAuth(event);
    await checkRole(user, 'admin');
    const User = await UserConnection.createConnection();
    const users = await User.find();
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({ users })
    });
  } catch (err) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      })
    });
  }
};
