export interface Habilitation {
    _id: string;
    userId: string;
    jobId: string;
    type: string;
    code: string;
    label: string;
    startDate: string | Date;
    endDate: string | Date;
    payrollSection: string;
    establishment: string;
    profession: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface HabilitationImportResult {
    created: number;
    skipped: number;
    errors: string[];
}

