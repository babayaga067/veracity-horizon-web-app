import { IAuction } from "../models/auction.model";
export declare class AuctionService {
    getAllAuctions(page?: number, limit?: number, search?: string, status?: string): Promise<{
        auctions: IAuction[];
        total: number;
        totalPages: number;
    }>;
    getFeaturedAuctions(): Promise<IAuction[]>;
    private _isFeatured;
    getAuctionById(id: string): Promise<IAuction | null>;
    getAuctionsByOwnerId(ownerId: string): Promise<IAuction[]>;
    getMyBids(userId: string): Promise<IAuction[]>;
    createAuction(auctionData: Partial<IAuction>, ownerId: string): Promise<IAuction>;
    placeBid(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction>;
    updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction | null>;
    deleteAuction(id: string): Promise<boolean>;
}
//# sourceMappingURL=auction.service.d.ts.map