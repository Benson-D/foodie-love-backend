import { Router, type Request, type Response } from "express";

const router: Router = Router();

router.get("/auth/user", (req: Request, res: Response) => {
  return res.json(req.user);
});

export default router;
