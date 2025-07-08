import { Router } from "express";
import { liveness } from "../controllers/health.controller";

const router = Router();

router.get("/liveness", liveness);
router.get("/readyness", liveness);

export default router;