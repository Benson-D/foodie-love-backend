import "./configs/passport";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieSession from "cookie-session";
import passport from "passport";
import { NotFoundError, ExpressError } from "./utils/expressError";
import recipeRoutes from "./routes/recipes";
import authRoutes from "./routes/auth";
import { COOKIE_SECRET } from "./configs/general";

const app: Express = express();

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [COOKIE_SECRET],
  }),
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.use("/recipes", recipeRoutes);
app.use("/auth", authRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req: Request, res: Response, next: NextFunction) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err: ExpressError, req: Request, res: Response) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);

  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

export default app;
