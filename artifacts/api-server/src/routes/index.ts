import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import tablesRouter from "./tables";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import inventoryRouter from "./inventory";
import employeesRouter from "./employees";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";
import licensesRouter from "./licenses";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(tablesRouter);
router.use(customersRouter);
router.use(ordersRouter);
router.use(inventoryRouter);
router.use(employeesRouter);
router.use(reportsRouter);
router.use(licensesRouter);

export default router;
