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
    const body = JSON.parse(event.body);
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user.sub
      },
      {
        bio: body.bio
      },
      {
        new: true
      }
    );

    return callback(null, {
      message: 'Bio updated!',
      bio: updatedUser.bio
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
