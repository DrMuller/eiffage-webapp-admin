export interface Simulation {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    ordinary_shares: OrdinaryShares[];
    preferred_shares: PreferredShares[];
    options: Options[];
    companyName: string;
    estimatedTransferDate: Date;
    estimatedExitDate: Date;
    carveOutValue: number;
}

// Interface for AO (Ordinary Shares) items
export interface OrdinaryShares {
    name: string;
    date: Date;
    nb_shares: number;
    share_price: number;
    amount: number;
}

// Interface for ADP (Preferred Shares) items
export interface PreferredShares {
    name: string;
    date: Date;
    seniority: number;
    nb_shares: number;
    share_price: number;
    amount: number;
    pref_type: string;
    pref_multiple: number;
    pref_tri: number;
    pref_effective_multiple: number;
    pref_pps: number;
    pref_amount: number;
}

// Interface for Options items
export interface Options {
    name: string;
    date: Date;
    nb_options: number;
    strike: number;
    nb_dead_options: number;
    nb_alive_options: number;
}

// Interface for Proceeds calculation output
export interface ProceedsOutput {
    exit_values: number[];
    options_exercise_points: {
        [key: string]: number;
    };
    proceeds: {
        pref_shares: {
            [key: string]: number[];
        };
        common_shares: number[];
    };
    share_price: {
        pref_shares: {
            [key: string]: number[];
        };
        common_shares: number[];
        prorata_fd: number[];
    };
}

// Interface for the entire data structure
export interface CapTableData {
    aos: OrdinaryShares[];
    adps: PreferredShares[];
    options: Options[];
}