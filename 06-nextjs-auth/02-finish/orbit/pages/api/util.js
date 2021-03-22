const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
import { serialize, parse } from 'cookie';

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
    'secret123',
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

const TOKEN_NAME = 'token';
const MAX_AGE = 3600; // 1 hour

export const setTokenCookie = (res, token) => {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax'
  });

  res.setHeader('Set-Cookie', cookie);
};

export const removeTokenCookie = res => {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/'
  });

  res.setHeader('Set-Cookie', cookie);
};

export const parseCookies = req => {
  if (req.cookies) return req.cookies;

  const cookie = req.headers?.cookie;
  return parse(cookie || '');
};

export const getTokenCookie = req => {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
};

module.exports = {
  createToken,
  hashPassword,
  verifyPassword,
  requireAdmin,
  setTokenCookie,
  getTokenCookie,
  parseCookies
};
