import { Request, Response, NextFunction } from "express";
import { aiSearch, aiNavigate, aiSuggest } from "../../services/ai/ai.service";

export class AIController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, category, page = 1, limit = 20 } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const result = await aiSearch(query, category, Number(page), Number(limit));
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: "AI search failed", error: (error as Error).message });
    }
  }

  async navigate(req: Request, res: Response, next: NextFunction) {
    try {
      const { intent, context } = req.body;
      if (!intent || typeof intent !== "string") {
        return res.status(400).json({ message: "Navigation intent is required" });
      }
      const result = await aiNavigate(intent, context);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: "AI navigation failed", error: (error as Error).message });
    }
  }

  async suggestions(_req: Request, res: Response) {
    try {
      const suggestions = await aiSuggest();
      return res.json(suggestions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch suggestions", error: (error as Error).message });
    }
  }
}
