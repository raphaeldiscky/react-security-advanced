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
    const body = JSON.parse(event.body);
    const InventoryItem = await InventoryItemConnection.createConnection();
    const input = Object.assign({}, body, {
      user: user.sub
    });
    const newInventoryItem = new InventoryItem(input);
    await newInventoryItem.save();
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        inventoryItem: newInventoryItem,
        message: 'Inventory item added!'
      })
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
