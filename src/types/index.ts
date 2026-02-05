import { Request, Response } from 'express';

// Type for async route handlers
export type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>;
