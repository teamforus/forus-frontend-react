import React, { useState } from 'react';
import { ProfileRecord } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function IdentityRecordKeyValueListHistory({ records }: { records: Array<ProfileRecord> }) {
    const translate = useTranslate();

    const [show, setShow] = useState(false);

    return (
        <div className={'key-value-list-item-value-history'}>
            <div className="key-value-list-item-value-history-header">
                <span>{records?.[0]?.value_locale || '-'}</span>
                {records?.length > 1 && (
                    <span className="key-value-list-item-value-history-toggle" onClick={() => setShow(!show)}>
                        {translate('profile.history.title', { count: records?.length })}
                        {show ? <em className="mdi mdi-chevron-up" /> : <em className="mdi mdi-chevron-down" />}
                    </span>
                )}
            </div>
            {show && (
                <div className="key-value-list-item-value-history-body">
                    {records.map((item, index) => (
                        <div
                            className="key-value-list-item-value-history-body-item"
                            key={index}
                            data-nth={`${records.length - index}/${records.length}`}>
                            <em className="mdi mdi-clock-outline key-value-list-item-value-history-body-item-icon" />
                            <div>
                                {'Gewijzigd door '}
                                <strong className="text-strong">{item.sponsor ? item.sponsor_name : 'jou'}</strong>{' '}
                            </div>
                            <div>{`${item.created_at_locale}`}</div>
                            <div className="hide-sm">•</div>
                            <div>
                                {` van `}
                                <strong>{`'${records[index + 1]?.value_locale || ''}'`}</strong>
                                {' naar '}
                                <strong>{`'${item.value_locale || ''}'`}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
