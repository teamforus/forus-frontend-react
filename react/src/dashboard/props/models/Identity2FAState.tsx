import Media from './Media';
import Auth2FAProvider from './Auth2FAProvider';
import Identity2FA from './Identity2FA';

interface Auth2FARestriction {
    restricted: boolean;
    funds: Array<{
        id: number;
        name: string;
        organization_id: number;
        logo?: Media;
    }>;
}

export default interface Identity2FAState {
    required: boolean;
    confirmed: boolean;
    providers: Array<Auth2FAProvider>;
    provider_types: Array<{
        type: 'phone' | 'authenticator';
        title: string;
        subtitle: string;
    }>;
    active_providers: Array<Identity2FA>;
    restrictions: {
        emails: Auth2FARestriction;
        sessions: Auth2FARestriction;
        reimbursements: Auth2FARestriction;
    };
    auth_2fa_remember_ip: boolean;
    auth_2fa_remember_hours?: number;
    auth_2fa_forget_force: {
        voucher: boolean;
        organization: boolean;
    };
}
