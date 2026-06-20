import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gamesRouter from "./games";
import usersRouter from "./users";
import subscriptionsRouter from "./subscriptions";
import reviewsRouter from "./reviews";
import wishlistRouter from "./wishlist";
import achievementsRouter from "./achievements";
import storeRouter from "./store";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gamesRouter);
router.use(usersRouter);
router.use(subscriptionsRouter);
router.use(reviewsRouter);
router.use(wishlistRouter);
router.use(achievementsRouter);
router.use(storeRouter);

export default router;
