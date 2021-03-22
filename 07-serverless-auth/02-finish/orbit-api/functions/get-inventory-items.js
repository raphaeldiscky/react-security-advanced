const InventoryItemConnection = require('../data/InventoryItemConnection');
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
    const InventoryItem = await InventoryItemConnection.createConnection();
    const items = await InventoryItem.find({
      user: user.sub
    });
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(items)
    });
  } catch (err) {
    console.log('the err', err);
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      })
    });
  }
};
