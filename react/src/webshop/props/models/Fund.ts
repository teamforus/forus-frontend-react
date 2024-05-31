import FundBase from '../../../dashboard/props/models/Fund';
import FundCriterion from './FundCriterion';
import Voucher from '../../../dashboard/props/models/Voucher';
import FundFormula from './FundFormula';
import FundCriteriaStep from './FundCriteriaStep';

export default interface Fund extends FundBase {
    is_external: boolean;
    vouchers: Array<Voucher>;
    allow_fund_requests?: boolean;
    allow_prevalidations?: boolean;
    allow_direct_requests?: boolean;
    has_pending_fund_requests: boolean;
    hide_meta?: boolean;
    taken_by_partner?: boolean;
    auto_validation?: boolean;
    bsn_confirmation_time?: number;
    criteria?: Array<FundCriterion>;
    criteria_steps?: Array<FundCriteriaStep>;
    formulas?: Array<FundFormula>;
    auth_2fa_policy?: 'global' | 'optional' | 'required' | 'restrict_features';
    auth_2fa_remember_ip: boolean;
    auth_2fa_restrict_emails: boolean;
    auth_2fa_restrict_auth_sessions: boolean;
    auth_2fa_restrict_reimbursements: boolean;

    email_required?: boolean;
    contact_info_enabled?: boolean;
    contact_info_required?: boolean;

    contact_info_message_text?: string;
    contact_info_message_default?: string;

    organization_funds_2fa?: {
        auth_2fa_policy: 'global' | 'optional' | 'required' | 'restrict_features';
        auth_2fa_remember_ip: boolean;
        auth_2fa_restrict_emails: boolean;
        auth_2fa_restrict_auth_sessions: boolean;
        auth_2fa_restrict_reimbursements: boolean;
    };
}
