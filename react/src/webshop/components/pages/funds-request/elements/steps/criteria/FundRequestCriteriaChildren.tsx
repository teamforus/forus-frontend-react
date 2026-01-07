import React, { Fragment, useCallback } from 'react';
import useTranslate from '../../../../../../../dashboard/hooks/useTranslate';
import RecordType from '../../../../../../../dashboard/props/models/RecordType';
import { Prefills } from '../../../FundRequest';
import { upperFirst } from 'lodash';

export default function FundRequestCriteriaChildren({
    prefills,
    recordTypesByKey,
}: {
    prefills: Prefills;
    recordTypesByKey: { [_key: string]: RecordType };
}) {
    const translate = useTranslate();

    const splitChildLabel = useCallback((text?: string) => {
        const match = text ? text.match(/^(Kind\s+\d+)\s+(.+)$/) : null;
        return match ? { child: match[1], value: upperFirst(match[2]) } : null;
    }, []);

    return (
        <Fragment>
            <div className="preview-item-info preview-item-info-vertical">
                <div className="preview-item-subtitle">{translate('fund_request.prefills.children')}</div>
            </div>

            {prefills.children.map((childObject, index) => (
                <div className="preview-item-panel" key={index}>
                    <div className="preview-item-values">
                        {childObject
                            .filter((child) => !child.record_type_key.endsWith('_bsn'))
                            .map((child, index) => (
                                <Fragment key={index}>
                                    {index === 0 && (
                                        <div className="preview-item-values-item">
                                            <div className="preview-item-values-item-title">
                                                {splitChildLabel(recordTypesByKey[child.record_type_key]?.name)?.child}
                                            </div>
                                        </div>
                                    )}

                                    <div className="preview-item-values-item">
                                        <div className="preview-item-values-item-label">
                                            {splitChildLabel(recordTypesByKey[child.record_type_key]?.name)?.value}
                                        </div>
                                        <div className="preview-item-values-item-value">{child.value || '-'}</div>
                                    </div>
                                </Fragment>
                            ))}
                    </div>
                </div>
            ))}
        </Fragment>
    );
}
