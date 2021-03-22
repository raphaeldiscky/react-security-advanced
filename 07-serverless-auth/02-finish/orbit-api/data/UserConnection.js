const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModel = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  bio: { type: String, required: false }
});

let connection = null;

const createConnection = async () => {
  try {
    if (!connection) {
      connection = mongoose.createConnection(
        process.env.ATLAS_URL,
        {
          bufferCommands: false,
          bufferMaxEntries: 0,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false
        }
      );
    }

    await connection;
    connection.model('user', userModel);

    return connection.model('user');
  } catch (err) {
    console.log('err from schema', err);
    return err;
  }
};

module.exports = {
  createConnection
};
