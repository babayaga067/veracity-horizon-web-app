import { IAuction } from "../models/auction.model";
export interface IAuctionRepository {
    getAll(page?: number, limit?: number, search?: string, status?: string): Promise<{
        auctions: IAuction[];
        total: number;
        totalPages: number;
    }>;
    getById(id: string): Promise<IAuction | null>;
    getByOwnerId(ownerId: string): Promise<IAuction[]>;
    getBidsByUserId(userId: string): Promise<IAuction[]>;
    createAuction(auction: Partial<IAuction>): Promise<IAuction>;
    updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
    deleteAuction(id: string): Promise<boolean>;
    placeBidAtomic(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction | null>;
}
export declare class AuctionMongoRepository implements IAuctionRepository {
    getAll(page?: number, limit?: number, search?: string, status?: string): Promise<{
        auctions: IAuction[];
        total: number;
        totalPages: number;
    }>;
    getByOwnerId(ownerId: string): Promise<IAuction[]>;
    getBidsByUserId(userId: string): Promise<IAuction[]>;
    getById(id: string): Promise<IAuction | null>;
    createAuction(auction: Partial<IAuction>): Promise<IAuction>;
    updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
    deleteAuction(id: string): Promise<boolean>;
    placeBidAtomic(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction | null>;
}
//# sourceMappingURL=auction.repository.d.ts.map