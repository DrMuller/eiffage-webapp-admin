export interface Client {
    _id: string;
    userId: string;
    organisationId: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    siren: string;
    logoUrl?: string;
    logoFileName?: string;
    createdAt: Date;
    updatedAt: Date;
} 