import { Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { SECRET_KEY } from "../configs/general";
import UserModel from "../models/UserModel";
import { createToken } from "../utils/token";
import { REFRESH_TIME } from "../configs/general";

class AuthController {
  public static async verifyRefreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_jwt;

    try {
      jwt.verify(
        refreshToken,
        SECRET_KEY,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (err: VerifyErrors | null, decoded: any | undefined) => {
          if (err || !decoded.id) {
            return res.status(403).json({ errors: "Invalid Refresh Token" });
          }

          const user = await UserModel.findById(decoded.id as string);
          if (!user) {
            return res.status(403).json({ message: "Invalid User" });
          }

          const tokenUserData = {
            id: user.id,
            username: user.username,
            role: user.role,
          };

          const token = createToken(tokenUserData);
          return res
            .status(201)
            .json({ message: "New Token Acquired!", token });
        },
      );
    } catch (err) {
      return res.status(401).json({ errors: "Invalid Refresh Token" });
    }
  }

  public static verifyGoogleOAuth2(req: Request, res: Response) {
    console.log(req.user, "<==== verifyGoogleOauth2");

    try {
      if (req.user) {
        const user = {
          id: req.user.id,
          username: req.user.username ?? "",
          role: req.user.role,
        };

        const token = createToken(user);
        const refreshToken = createToken(user, REFRESH_TIME);

        res
          .cookie("refresh_jwt", refreshToken, {
            httpOnly: true,
            secure: true,
          })
          .header("Authorization", `Bearer ${token}`)
          .status(200)
          .json({ token, user: req.user });
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err });
    }
  }

  public static userLogout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
      }
    });

    res
      .clearCookie("refresh_jwt", { httpOnly: true, secure: false })
      .send({ message: "Successful Logout!" });
  }
}

export default AuthController;
