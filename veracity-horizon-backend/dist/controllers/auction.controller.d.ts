import { Request, Response, NextFunction } from "express";
export declare class AuctionController {
    listAuctions(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getFeaturedAuctions(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getAuctionById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getMyAuctions(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getMyBids(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    createAuction(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    placeBid(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    updateAuction(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    deleteAuction(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=auction.controller.d.ts.map