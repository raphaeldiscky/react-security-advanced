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
    const queryString = event.queryStringParameters;
    const InventoryItem = await InventoryItemConnection.createConnection();

    const deletedItem = await InventoryItem.findOneAndDelete(
      { _id: queryString.id, user: user.sub }
    );
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        deletedItem: deletedItem,
        message: 'Inventory item deleted!'
      })
    });
  } catch (err) {
    console.log(err);
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      })
    });
  }
};
