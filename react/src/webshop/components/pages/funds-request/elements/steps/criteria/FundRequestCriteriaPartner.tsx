import React, { Fragment, useCallback } from 'react';
import useTranslate from '../../../../../../../dashboard/hooks/useTranslate';
import RecordType from '../../../../../../../dashboard/props/models/RecordType';
import { Prefills } from '../../../FundRequest';
import { upperFirst } from 'lodash';

export default function FundRequestCriteriaPartner({
    prefills,
    recordTypesByKey,
}: {
    prefills: Prefills;
    recordTypesByKey: { [_key: string]: RecordType };
}) {
    const translate = useTranslate();

    const splitPartnerLabel = useCallback((text?: string) => {
        const match = text ? text.match(/^(Partner)\s+(.+)$/) : null;
        return match ? { partner: match[1], value: upperFirst(match[2]) } : null;
    }, []);

    return (
        <Fragment>
            <div className="preview-item-info preview-item-info-vertical">
                <div className="preview-item-subtitle">{translate('fund_request.prefills.partner')}</div>
            </div>

            <div className="preview-item-panel">
                <div className="preview-item-values">
                    {prefills.partner
                        .filter((partner) => !partner.record_type_key.endsWith('_bsn'))
                        .map((partner, index) => (
                            <div className="preview-item-values-item" key={index}>
                                <div className="preview-item-values-item-label">
                                    {splitPartnerLabel(recordTypesByKey[partner.record_type_key]?.name)?.value}
                                </div>
                                <div className="preview-item-values-item-value">{partner.value || '-'}</div>
                            </div>
                        ))}
                </div>
            </div>
        </Fragment>
    );
}
