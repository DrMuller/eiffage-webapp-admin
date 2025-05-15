export interface Organisation {
    _id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    siren: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
} 