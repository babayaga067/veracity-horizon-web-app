import { Router } from "express";
import { AIController } from "../../controllers/ai/ai.controller";
import { apiRateLimiter } from "../../middlewares/rate-limit.middleware";

const router = Router();
const controller = new AIController();

router.post("/search", apiRateLimiter, (req, res, next) => controller.search(req, res, next));
router.post("/navigate", apiRateLimiter, (req, res, next) => controller.navigate(req, res, next));
router.get("/suggestions", apiRateLimiter, (req, res) => controller.suggestions(req, res));

export default router;
