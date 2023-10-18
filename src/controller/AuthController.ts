import { Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { SECRET_KEY } from "../configs/general";
import UserModel from "../models/userModel";
import { createToken } from "../utils/token";
import { REFRESH_TIME } from "../configs/general";

class AuthController {
  public static async verifyRefreshToken(req: Request, res: Response) {
    const { refreshToken } = req.cookies;

    try {
      jwt.verify(
        refreshToken,
        SECRET_KEY,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (err: VerifyErrors | null, decoded: any | undefined) => {
          if (err || !decoded.username) {
            return res.status(401).json({ errors: "Invalid Refresh Token" });
          }

          const user = await UserModel.get(decoded.username as string);
          const token = createToken(user);
          return res
            .status(201)
            .json({ message: "New Token Acquired!", token });
        },
      );
    } catch (err) {
      return res.status(401).json({ errors: "Invalid Refresh Token" });
    }
  }

  public static userLogout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
      }
    });

    res.send("Successful Logout!");
  }

  public static verifyGoogleOAuth2(req: Request, res: Response) {
    let redirectUrl = "http://localhost:5173/login/error";

    try {
      if (req.user) {
        const user = {
          id: req.user.googleId,
          isAdmin: req.user.isAdmin,
        };

        const token = createToken(user);
        const refreshToken = createToken(user, REFRESH_TIME);

        const cookeOptions = {
          httpOnly: true,
          secure: true,
        };

        res.cookie("jwt", token, cookeOptions);
        res.cookie("refresh_jwt", refreshToken, cookeOptions);

        redirectUrl = "http://localhost:5173/login/success";
      }
    } catch (err) {
      console.error(err);
    }

    res.redirect(redirectUrl);
  }
}

export default AuthController;
