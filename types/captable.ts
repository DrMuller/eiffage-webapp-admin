export interface CaptableRequest {
    pref_shares: PrefShareRequest[];
    common_shares: CommonShareRequest[];
    options: OptionRequest[];
    params: ParamsRequest;
    exit_values?: number[];
}

export interface PrefShareRequest {
    name: string;
    date: Date;
    seniority: number;
    nb_shares: number;
    share_price: number;
    amount: number;
    pref_type: 'P' | 'NP';  // Participating or Non-participating
    pref_multiple: number;
    pref_tri?: number;
}

export interface CommonShareRequest {
    name: string;
    date: Date;
    nb_shares: number;
    share_price: number;
    amount: number;
}

export interface OptionRequest {
    name: string;
    date: Date;
    nb_options: number;
    strike: number;
    nb_dead_options: number;
}

export interface ParamsRequest {
    carve_out: number;
    estimated_transfer_date?: Date;
}

export interface CaptableResponse {
    _id: string;
    userId: string;
    organisationId: string;
    pref_shares: PrefShareResponse[];
    common_shares: CommonShareResponse[];
    options: OptionResponse[];
    params: ParamsResponse;
}


export interface PrefShareResponse extends PrefShareRequest {
    pref_effective_multiple: number;
    pref_share_price: number;
    pref_amount: number;
    net_pref_amount?: number;
}

export interface OptionResponse extends OptionRequest {
    nb_alive_options: number;
}

export interface ParamsResponse extends ParamsRequest {
    nominal: number;
}

export type CommonShareResponse = CommonShareRequest;