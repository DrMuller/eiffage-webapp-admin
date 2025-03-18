export interface SimulationRequest {
    company_name: string;
    estimated_transfer_date: Date;
    carve_out: number;
    pref_shares: PrefShare[];
    common_shares: CommonShare[];
    options: Option[];
    params: Params;
    exit_values?: number[];
}

export interface PrefShare {
    name: string;
    date: Date;
    seniority: number;
    nb_shares: number;
    share_price: number;
    amount: number;
    pref_type: 'P' | 'NP';  // Participating or Non-participating
    pref_multiple: number;
    pref_tri: number;
    pref_effective_multiple: number;
    pref_share_price: number;
    pref_amount: number;
    net_pref_amount?: number;  // Added for internal calculations
}

export interface CommonShare {
    name: string;
    date: Date;
    nb_shares: number;
    share_price: number;
    amount: number;
}

export interface Option {
    name: string;
    date: Date;
    nb_options: number;
    strike: number;
    nb_dead_options: number;
    nb_alive_options: number;
}

export interface Params {
    nominal: number;
    carve_out: number;
}
