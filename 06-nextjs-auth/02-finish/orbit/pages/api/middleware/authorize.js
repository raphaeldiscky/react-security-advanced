import nextConnect from 'next-connect';
import { getTokenCookie } from './../util';
import * as jwt from 'jsonwebtoken';

async function authorize(req, res, next) {
  try {
    const token = getTokenCookie(req);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: 'Not authorized' });
  }
}

const middleware = nextConnect();

middleware.use(authorize);

export default middleware;
