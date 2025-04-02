import type { SimulationResult } from '~/types/simulation'

// Define chart series item type
interface ChartSeriesItem {
    values: number[];
    color: string;
    dash?: number[];
    lineWidth?: number;
}

// Define a color palette for chart series
const CHART_COLORS = {
    PREF_SHARES_BASE: ['#004f63', '#08878a', '#77bfa8', '#2c6e49', '#4c956c'],
    COMMON_SHARES: '#77bfa8',
    PRORATA_FD: '#bbbbbb'
}

export const useSimulationChart = () => {
    // Transform SimulationResult for chart components
    const transformSimulationResults = (results: SimulationResult) => {
        // Get all preferred share types
        const prefSharesNames = Object.keys(results.share_price.pref_shares)

        // Transform share price data
        const sharePriceSeries = prefSharesNames.reduce((acc, name, index) => {
            acc[name] = {
                values: results.share_price.pref_shares[name],
                color: CHART_COLORS.PREF_SHARES_BASE[index % CHART_COLORS.PREF_SHARES_BASE.length]
            }
            return acc
        }, {} as Record<string, ChartSeriesItem>)

        // Add common shares
        sharePriceSeries['Actions ordinaires'] = {
            values: results.share_price.common_shares,
            color: CHART_COLORS.COMMON_SHARES
        }

        // Add prorata FD line
        sharePriceSeries['Prorata FD'] = {
            values: results.share_price.prorata_fd,
            color: CHART_COLORS.PRORATA_FD,
            dash: [5, 5],
            lineWidth: 2
        }

        // Transform proceeds data
        const proceedsSeries = prefSharesNames.reduce((acc, name, index) => {
            acc[name] = {
                values: results.proceeds.pref_shares[name],
                color: CHART_COLORS.PREF_SHARES_BASE[index % CHART_COLORS.PREF_SHARES_BASE.length]
            }
            return acc
        }, {} as Record<string, ChartSeriesItem>)

        // Add common shares
        proceedsSeries['Actions ordinaires'] = {
            values: results.proceeds.common_shares,
            color: CHART_COLORS.COMMON_SHARES
        }

        return {
            exitValues: results.exit_values,
            sharePriceSeries,
            proceedsSeries
        }
    }

    return {
        transformSimulationResults
    }
} 