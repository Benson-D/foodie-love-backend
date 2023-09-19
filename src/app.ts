import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import { NotFoundError, ExpressError } from "./utils/expressError";
import recipeRoutes from "./routes/recipes";
import authRoutes from "./routes/auth";

const app: Express = express();

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
