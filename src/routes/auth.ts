import { Router, Request, Response } from "express";
import passport from "passport";
import AuthController from "../controller/AuthController";
import { isUserAuthenticated } from "../middleware/auth";

const router: Router = Router();

router.post("/refresh", AuthController.verifyRefreshToken);

router.get(
  "/google",
  passport.authenticate("google", {
    accessType: "offline",
    prompt: "consent",
    scope: ["email", "profile"],
  }),
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureMessage: "Cannot login to Google, please try again later!",
    failureRedirect: "https://foodielove.vercel.app/login/error",
  }),
  (req: Request, res: Response) => {
    console.log("<======GOOGLE REDIRECT======>");
    console.log("Requesting URL:", req.headers.referer);
    console.log("Requesting user:", req.user);
    console.log("Requesting session:", req.session);

    res.cookie("authorized-user", JSON.stringify(req.user));
    res.redirect("https://foodielove.vercel.app/login/success");
  },
);

router.get("/user", isUserAuthenticated, AuthController.verifyGoogleOAuth2);

router.post("/logout", AuthController.userLogout);

export default router;
