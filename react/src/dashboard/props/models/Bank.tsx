export default interface Bank {
    id: number;
    key: string;
    name: string;
    oauth_redirect_id?: string;
    oauth_redirect_url?: string;
    transaction_cost: number;
}
