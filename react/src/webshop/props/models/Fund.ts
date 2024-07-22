import FundBase from '../../../dashboard/props/models/Fund';
import Voucher from '../../../dashboard/props/models/Voucher';
import FundCriteriaStep from '../../../dashboard/props/models/FundCriteriaStep';

export default interface Fund extends FundBase {
    is_external: boolean;
    vouchers: Array<Voucher>;
    allow_direct_requests?: boolean;
    has_pending_fund_requests: boolean;
    hide_meta?: boolean;
    taken_by_partner?: boolean;
    auto_validation?: boolean;
    bsn_confirmation_time?: number;
    criteria_steps?: Array<FundCriteriaStep>;
    email_required?: boolean;
    contact_info_enabled?: boolean;
    contact_info_required?: boolean;
    contact_info_message_text?: string;
    contact_info_message_default?: string;
}
