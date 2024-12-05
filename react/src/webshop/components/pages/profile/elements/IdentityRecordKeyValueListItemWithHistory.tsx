import React, { useState } from 'react';
import { ProfileRecord } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';

export default function IdentityRecordKeyValueListItemWithHistory({ records }: { records: Array<ProfileRecord> }) {
    const [show, setShow] = useState(false);

    return (
        <div className={'key-value-list-item-value-history'}>
            <div className="key-value-list-item-value-history-header">
                <span>{records?.[0]?.value_locale || '-'}</span>
                {records?.length > 1 && (
                    <span className="key-value-list-item-value-history-toggle" onClick={() => setShow(!show)}>
                        {`${records?.length} keer bewerkt`}
                        {show ? <em className="mdi mdi-chevron-up" /> : <em className="mdi mdi-chevron-down" />}
                    </span>
                )}
            </div>
            {show && (
                <div className="key-value-list-item-value-history-body">
                    {records.map((item, index) => (
                        <div className="key-value-list-item-value-history-body-item" key={index}>
                            <em className="mdi mdi-clock-outline" />
                            {'Gewijzigd door '}
                            <strong className="text-strong">{item.sponsor ? item.sponsor_name : 'jou'}</strong>{' '}
                            {`${item.created_at_locale} • van `}
                            <strong>{`'${records[index + 1]?.value_locale || ''}'`}</strong>
                            {' naar '}
                            <strong>{`'${item.value_locale || ''}'`}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
