import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../configs/general';

/** Return a signed JWT from user data. */
function createToken(user: { username: string; isAdmin?: boolean }) {
  console.assert(
    user.isAdmin !== undefined,
    'createToken passed user without isAdmin property'
  );

  const payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY as string);
}

export { createToken };