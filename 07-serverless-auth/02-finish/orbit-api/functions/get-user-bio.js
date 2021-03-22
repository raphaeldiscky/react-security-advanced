const UserConnection = require('../data/UserConnection');
const { checkAuth } = require('../util');

exports.handler = async function (
  event,
  context,
  callback
) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const user = await checkAuth(event);
    const User = await UserConnection.createConnection();

    const foundUser = await User.findOne({
      _id: user.sub
    })
      .lean()
      .select('bio');

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({ bio: foundUser.bio })
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
