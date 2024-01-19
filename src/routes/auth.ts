import { Router } from "express";
import passport from "passport";
import AuthController from "../controller/AuthController";
import { isUserAuthenticated } from "../middleware/auth";

const router: Router = Router();

router.post("/", AuthController.verifyOAuth2SignIn);
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
    successRedirect: "https://foodielove.vercel.app/recipes",
  }),
);

router.get("/user", isUserAuthenticated, AuthController.verifyGoogleOAuth2);

router.post("/logout", AuthController.userLogout);

export default router;
