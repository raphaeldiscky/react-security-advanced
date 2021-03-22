const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const createToken = user => {
  // Sign the JWT
  if (!user.role) {
    throw new Error('No user role specified');
  }
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role,
      iss: 'api.orbit',
      aud: 'api.orbit'
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
};

const hashPassword = password => {
  return new Promise((resolve, reject) => {
    // Generate a salt at level 12 strength
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

const verifyPassword = (
  passwordAttempt,
  hashedPassword
) => {
  return bcrypt.compare(passwordAttempt, hashedPassword);
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'There was a problem authorizing the request'
    });
  }
  if (req.user.role !== 'admin') {
    return res
      .status(401)
      .json({ message: 'Insufficient role' });
  }
  next();
};

const checkAuth = event => {
  return new Promise((resolve, reject) => {
    try {
      const { authorization } = event.headers;
      if (!authorization) {
        reject('Not authorized');
      }
      const token = authorization.slice(7);
      if (!token) {
        reject('Not authorized');
      }
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      resolve(decoded);
    } catch (err) {
      reject(err);
    }
  });
};

const checkRole = (user, requiredRole) => {
  return new Promise((resolve, reject) => {
    try {
      if (!user.role) {
        reject('Role note specified');
      }
      if (user.role !== requiredRole) {
        reject('Insufficient role');
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  createToken,
  hashPassword,
  verifyPassword,
  requireAdmin,
  checkAuth,
  checkRole
};
