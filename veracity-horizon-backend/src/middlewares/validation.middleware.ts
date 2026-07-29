import { Request, Response, NextFunction } from "express";
import { z } from "zod";

function formatZodErrors(error: z.ZodError): { field: string; message: string }[] {
  return error.issues.map((issue: z.ZodIssue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(parsed.error),
      });
    }
    Object.assign(req.query, parsed.data);
    next();
  };
}

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(parsed.error),
      });
    }
    Object.assign(req.body, parsed.data);
    next();
  };
}