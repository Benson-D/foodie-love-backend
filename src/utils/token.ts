import jwt from "jsonwebtoken";
import { SECRET_KEY, TOKEN_TIME } from "../configs/general";

/** Return a signed JWT from user data. */
function createToken(
  user: { id: string; username: string | null; role?: string },
  time?: string,
) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || "CLIENT",
  };

  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: !time ? TOKEN_TIME : time,
  });
}

export { createToken };
