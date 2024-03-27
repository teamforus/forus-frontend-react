export interface ProviderFinancialTransaction {
    id: number;
    amount: string;
    provider?: string;
}

export interface ProviderFinancialDailyTransaction {
    amount?: string;
    date?: string;
    date_locale?: string;
}

export interface FinancialFilterOptionItem {
    id?: number;
    name: string;
    checked?: boolean;
    transactions?: number;
}

export interface ProviderFinancialFilterOptions {
    funds: Array<FinancialFilterOptionItem>;
    postcodes: Array<FinancialFilterOptionItem>;
    providers: Array<FinancialFilterOptionItem>;
    product_categories: Array<FinancialFilterOptionItem>;
    business_types: Array<FinancialFilterOptionItem>;
}

export default interface ProviderFinancialStatistics {
    dates: Array<{
        key: string;
        count: number;
        amount?: string;
        highest_daily_transaction?: ProviderFinancialDailyTransaction;
        highest_transaction?: ProviderFinancialTransaction;
        lowest_transaction?: ProviderFinancialTransaction;
    }>;
    totals: {
        amount: string;
        amount_locale: string;
        count: string;
    };
    lowest_transaction?: ProviderFinancialTransaction;
    highest_transaction?: ProviderFinancialTransaction;
    highest_daily_transaction?: ProviderFinancialDailyTransaction;
    filters: ProviderFinancialFilterOptions;
}
