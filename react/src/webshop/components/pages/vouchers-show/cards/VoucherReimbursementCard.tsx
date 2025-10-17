import React, { Fragment } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import IconReimbursement from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function VoucherReimbursementCard({ voucher }: { voucher: Voucher }) {
    const translate = useTranslate();

    return (
        <Fragment>
            {voucher.fund.allow_reimbursements && !voucher.expired && !voucher.deactivated && (
                <div className="block block-action-card">
                    <div className="block-card-logo block-card-logo-background">
                        <IconReimbursement />
                    </div>
                    <div className="block-card-details">
                        <h3 className="block-card-title">{translate('voucher.reimbursement.title')}</h3>
                        <div className="block-card-description">{translate('voucher.reimbursement.description')}</div>
                    </div>
                    <div className="block-card-actions">
                        <StateNavLink
                            name={'reimbursements-create'}
                            params={{ voucher_id: voucher.id }}
                            className="button button-primary">
                            <em className="mdi mdi-plus icon-start" />
                            {translate('voucher.reimbursement.button')}
                        </StateNavLink>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
