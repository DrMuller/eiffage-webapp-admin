import type { SimulationRequest } from "./simulationRequest";

// Output interface
export interface SimulationResult {
    exit_values: number[];
    options_exercise_points: {
        [key: string]: number;
    };
    pref_shares_refund_breakpoints?: {
        [key: string]: number;
    } & {
        all_shares_at_prorata?: number;
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
    more: {
        all_shares_at_prorata: boolean[];
        nb_exercised_options: number[];
        options_exercise_proceeds: number[];
        total_nb_shares: number[];
        nb_pref_shares: number;
        nb_common_shares: number;
        nb_options: number;
        nb_common_shares_fd: number;
        total_nb_shares_fd: number;
    };
} 

export interface Simulation {
    _id: string;
    userId: string;
    company_name: string;
    results: SimulationResult;
    request: SimulationRequest;
    created_at: Date;
    updated_at: Date;
} 