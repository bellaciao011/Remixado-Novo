import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import checkoutRouter from "./checkout";
import trackingRouter from "./tracking";
import emailRouter from "./email";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(checkoutRouter);
router.use(trackingRouter);
router.use(emailRouter);
router.use(adminRouter);

export default router;
