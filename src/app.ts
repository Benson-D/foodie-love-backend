import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import passport from "passport";
import "./configs/passportGoogleOAuth2";
import "./configs/passportJWT";
import { NotFoundError, ExpressError } from "./utils/expressError";
import recipeRoutes from "./routes/recipes";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import { COOKIE_SECRET } from "./configs/general";

const app: Express = express();

// app.set("trust proxy", 1);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// middleware for cookies
app.use(cookieParser());

// built-in middleware for json
app.use(express.json());
app.use(morgan("tiny"));

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: ["http://localhost:5173", "https://foodielove.vercel.app"],
    credentials: true,
  }),
);

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [COOKIE_SECRET],
    secure: true,
    sameSite: "none",
  }),
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/recipes", recipeRoutes);

app.get("/", (req: Request, res: Response) => {
  // Log the session information
  console.log("Session:", req.session);

  // Your other route handling logic here
  res.send("Hello, Welcome to the Foodie API!");
});

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
